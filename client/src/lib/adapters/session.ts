import { v4 as uuidv4 } from 'uuid';
import QuillDocument from "@/lib/adapters/quill-document.ts";
import Document from "@/lib/crdt/document.ts";
import { WSConnection } from "@/lib/websocket/websocket.ts";
import { Delta, Range } from "quill/core";
import { MessageType, WSMessage } from "@/lib/websocket/ws-message.ts";
import { Operation, OperationType } from "@/lib/crdt/operation.ts";
import Character from "@/lib/crdt/character.ts";
import Config from "@/lib/config.ts";
import { Queue } from "@/lib/containers/collections.ts";
import { IncomingCursorUpdate, OutgoingCursorUpdate } from "@/lib/models/cursor-update.ts";
import { randomColor } from "@/lib/utils.ts";
import TitleUpdate from "@/lib/models/title-update.ts";

class Session {
    clientId: string;
    document: Document;
    quillAdapter: QuillDocument;
    socket: WSConnection;
    counter: number;
    initialDelta?: Delta
    private onIncomingDeltaCallback?: (delta: Delta) => void
    private onIncomingCursorCallback?: (cursor: IncomingCursorUpdate) => void
    private onIncomingTitleCallback?: (title: string) => void
    private operationQueue: Queue<Operation>;
    private versionVector: Map<string, number>;
    private QUEUE_CHECK_INTERVAL_MS = 10;
    private queueIntervalId? : NodeJS.Timeout = undefined;
    private queueLock = false;
    private color = this.getColor();

    constructor(documentId: string) {
        this.clientId = sessionStorage.getItem("client_id") ?? uuidv4();
        sessionStorage.setItem("client_id", this.clientId);
        this.document = new Document(documentId);
        this.quillAdapter = new QuillDocument(this.document, this.clientId);
        const token = localStorage.getItem("auth_token") ?? "";
        const url = wSUrl(Config.SERVER_BASE_URL, this.clientId, documentId, token, Config.SSL)
        this.socket = new WSConnection(url);
        this.counter = parseInt(sessionStorage.getItem("counter") ?? "0");
        this.operationQueue = new Queue<Operation>();
        this.versionVector = this.initSessionVersionVector();
    }

    processDelta(delta: Delta) {
        const operations = this.quillAdapter.applyDelta(delta, this.counter);
        this.counter += operations.length;
        sessionStorage.setItem("counter", this.counter.toString())
        for (let operation of operations) {
            const message = new WSMessage(
                MessageType.Operation,
                operation
            )
            this.socket.enqueue(message)
        }
    }

    processCursorChange(range: Range) {
        const update = new OutgoingCursorUpdate(range.index, range.length, this.color);
        const message = new WSMessage(
            MessageType.Cursor,
            update
        )
        this.socket.enqueue(message)
    }

    processTitleChange(title: string) {
        const update = new TitleUpdate(this.document.id, this.clientId, title);
        const message = new WSMessage(
            MessageType.TitleChange,
            update
        )
        this.socket.enqueue(message)
    }

    onIncomingDelta(callback: (delta: Delta) => void) {
        this.onIncomingDeltaCallback = callback;
        if (this.initialDelta) {
            callback(this.initialDelta);
        }
    }

    onIncomingCursor(callback: (cursor: IncomingCursorUpdate) => void) {
        this.onIncomingCursorCallback = callback;
    }

    onIncomingTitle(callback: (title: string) => void) {
        this.onIncomingTitleCallback = callback;
    }

    addCharacters(characters: Character[]): Delta {
        characters.forEach((chr) => {
            const operation = new Operation(
                OperationType.Insert, chr.documentId,
                chr.id, chr.value, this.clientId,
                chr.position, 0
            )
            return this.document.apply(operation)
        })

        const delta = new Delta()
        delta.insert(this.document.getText())
        return delta;
    }

    connect() {
        if (this.onIncomingDelta === undefined) {
            throw Error("onIncomingDeltaCallback not set yet. Provide the callback function before connecting.");
        }
        this.configSocket();
        this.socket.listen();
        this.socket.startQueue();
        this.startQueue()
    }

    close() {
        this.socket.close();
        clearInterval(this.queueIntervalId);
        this.queueIntervalId = undefined;
    }

    onConnectionChange(callback: (connected: boolean) => void) {
        this.socket.onConnectionChange(callback);
    }

    onConnectingChange(callback: (connecting: boolean) => void) {
        this.socket.onConnectingChange(callback);
    }

    onDisconnected(callback: () => void) {
        this.socket.onDisconnect(callback);
    }

    reconnect() {
        this.socket.retryConnect();
    }

    private onWsMessageCursor(message: WSMessage<IncomingCursorUpdate>) {
        if (this.onIncomingCursorCallback === undefined) {
            return;
        }
        const cursor = IncomingCursorUpdate.fromJSON(message.data);
        if (cursor.clientId === this.clientId) {
            return;
        }
        this.onIncomingCursorCallback!(cursor);
    }

    private onWsMessageTitle(message: WSMessage<TitleUpdate>) {
        if (this.onIncomingTitleCallback === undefined) {
            return;
        }
        const title = TitleUpdate.fromJSON(message.data);
        if (title.clientId === this.clientId) {
            return;
        }
        this.onIncomingTitleCallback!(title.title);
    }

    private onWsMessageOperation(message: WSMessage<Operation>) {
        const operation = Operation.fromJSON(message.data);
        if (operation.clientId === this.clientId) {
            return;
        }
        this.operationQueue.enqueue(operation);
    }

    private startQueue() {
        if (this.queueIntervalId === undefined) {
            this.queueIntervalId = setInterval(async () => {
                if (this.queueLock) return;
                this.queueLock = true;
                await this.processFromQueue();
                this.queueLock = false;
            }, this.QUEUE_CHECK_INTERVAL_MS);
        }
    }

    private async processFromQueue() {
        if (!this.operationQueue.isEmpty() && this.onIncomingDeltaCallback != undefined) {
            await this.processOperation(this.operationQueue.dequeue())
        }
    }

    private async processOperation(operation: Operation) {
        const cid = operation.clientId;
        const counter = operation.counter;

        if (this.versionVector.get(cid) === undefined) {
            this.versionVector.set(cid, counter);
            this.applyOperation(operation);
        } else if (counter <= this.versionVector.get(cid)!) {
            return;
        } else if (counter == this.versionVector.get(cid)! + 1) {
            this.applyOperation(operation);
            this.updateVersionVector(cid, counter);
        } else {
            await this.fetchAndApplyOperations(cid, this.versionVector.get(cid)!);
        }
    }

    private applyOperation(operation: Operation) {
        const delta = this.quillAdapter.applyOperation(operation);
        this.onIncomingDeltaCallback!(delta);
    }

    private async fetchAndApplyOperations(clientId: string, counter: number): Promise<void> {
        let operations = await fetchOperations(this.document.id, clientId, counter);
        operations = operations.sort((a, b) => a.counter - b.counter);
        let prev = counter;
        for (let op of operations) {
            if (op.counter == prev + 1) {
                this.applyOperation(op);
                this.updateVersionVector(clientId, op.counter);
                prev = op.counter;
            }
        }
    }

    private updateVersionVector(clientId: string, counter: number) {
        this.versionVector.set(clientId, counter);
        sessionStorage.setItem("version_vector", JSON.stringify(this.versionVector));
    }

    private configSocket() {
        this.socket.registerHandler(
            MessageType.Operation,
            (msg: WSMessage<Operation>) => this.onWsMessageOperation(msg)
        );
        this.socket.registerHandler(
            MessageType.Cursor,
            (msg: WSMessage<IncomingCursorUpdate>) => this.onWsMessageCursor(msg)
        );
        this.socket.registerHandler(
            MessageType.TitleChange,
            (msg: WSMessage<TitleUpdate>) => this.onWsMessageTitle(msg)
        );
    }

    private initSessionVersionVector(): Map<string, number> {
        const prevSession = sessionStorage.getItem("version_vector") ?? "{}";
        const obj = JSON.parse(prevSession);
        const kvPairs = Object.keys(obj).map((key) => [key, obj[key]])
        return new Map<string, number>(kvPairs as [string, number][])
    }

    private getColor() {
        let color = localStorage.getItem("cursor_color");
        if (color === null) {
            color = randomColor();
            localStorage.setItem("cursor_color", color);
        }
        return color;
    }
}

export default Session;


function wSUrl(baseUrl: string, clientId: string, documentId: string, token: string, ssl: boolean) {
    return `${ssl?'wss':'ws'}:${baseUrl}/ws?cid=${clientId}&d=${documentId}&tkn=${token}`;
}

async function fetchOperations(documentId: string, clientId: string, counter: number): Promise<Operation[]> {
    const url = `${Config.formattedBaseUrl()}/operations?cid=${clientId}&d=${documentId}&ctrgeq=${counter}`;
    const response = await fetch(url);
    const json = await response.json();
    const operations = json.map((item: any) => {
        Operation.fromJSON(item);
    })
    return operations;
}