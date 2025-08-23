import { Queue } from "@/lib/containers/collections.ts";
import { MessageData, MessageHandler, MessageType, WSMessage } from "@/lib/websocket/ws-message.ts";
import { Operation } from "@/lib/crdt/operation.ts";

// WebSocket connection class.
//
// Manages a message queue and handlers for different message types.
class WSConnection {
    private ws: WebSocket;
    private queue: Queue<WSMessage<MessageData>>;
    private handlers: Map<MessageType, MessageHandler<any>>;
    private queueIntervalId: NodeJS.Timeout | undefined = undefined;
    private retryFlag = false;
    private listening = false;
    private connected: boolean;
    private onConnectionChangeCallback: (connected: boolean) => void;
    private onConnectingCallback: (connecting: boolean) => void;
    private onDisconnectCallback: () => void;

    QUEUE_CHECK_INTERVAL_MS = 10;
    MAX_RETRIES = 10;
    RETRY_INTERVAL_MS = 3000;

    constructor(url: string) {
        this.connected = false;
        this.onConnectionChangeCallback = () => {};
        this.onDisconnectCallback = () => {};
        this.onConnectingCallback = () =>{}

        this.ws = new WebSocket(url);
        this.setupWs();
        this.queue = new Queue<WSMessage<Operation>>();
        this.handlers = new Map<MessageType, MessageHandler<MessageData>>();
    }

    private setupWs() {
        this.onConnectingCallback(true);
        this.ws.onopen = () => {
            const prevConnected = this.connected;
            this.connected = true;
            if (prevConnected == false) {
                this.onConnectionChangeCallback(true);
            }
            this.onConnectingCallback(false);
        }

        this.ws.onclose = () => {
            const prevConnected = this.connected;
            this.connected = false;
            if (!this.retryFlag) {
                this.retryConnect();
                this.retryFlag = true;
            }
            if (prevConnected == true) {
                this.onConnectionChangeCallback(false);
            }
        }
    }

    // Register a handler for a specific message type.
    // The handler will be called when a message of the specified type is received.
    registerHandler<T extends MessageData>(type: MessageType, handler: MessageHandler<T>) {
        this.handlers.set(type, handler);
    }

    // Start listening for messages from the server and call the appropriate handler.
    // Handlers are registered using the `registerHandler` method.
    listen() {
        const messageHandler = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            const message = new WSMessage<MessageData>(data.type, data.data);
            if (this.handlers.has(message.type)) {
                this.handlers.get(message.type)!(message);
            } else {
                console.error(`No handler for message type: ${message.type}`);
            }
        }
        this.ws.addEventListener("message", messageHandler);
        this.startQueue();
        this.listening = true;
    }

    // Send a message to the server.
    //
    // It doesn't guarantee that the message will be sent immediately.
    // The message will be added to a queue and sent eventually.
    enqueue(message: WSMessage<MessageData>) {
        this.queue.enqueue(message);
    }

    // Start sending messages from the queue.
    startQueue() {
        this.queueIntervalId = setInterval(() => {
            this.sendFromQueue();
        }, this.QUEUE_CHECK_INTERVAL_MS);
    }

    // Stop sending messages from the queue.
    stopQueue() {
        if (this.queueIntervalId) {
            clearInterval(this.queueIntervalId);
        }
    }

    // Register a callback to be called when the connection status changes.
    onConnectionChange(callback: (connected: boolean) => void) {
        this.onConnectionChangeCallback = callback;
    }

    onConnectingChange(callback: (connecting: boolean) => void) {
        this.onConnectingCallback = callback;
    }

    // Register a callback to be called when the maximum number of retries is reached.
    // This can be used to notify the user that the connection could not be established.
    onDisconnect(callback: () => void) {
        this.onDisconnectCallback = callback;
    }

    // Close the WebSocket connection
    close() {
        this.stopQueue();
        this.ws.onclose = () => {}
        this.ws.close();
        this.listening = false;
        this.queueIntervalId = undefined;
    }

    private send(data: any) {
        this.ws.send(JSON.stringify(data))
    }

    private sendFromQueue() {
        if (!this.queue.isEmpty() && this.ws.readyState == this.ws.OPEN) {
            const message = this.queue.dequeue();
            this.send(message.toJSON());
        }
    }

    retryConnect() {
        let retries = 0;
        this.onConnectingCallback(true);
        const intervalId = setInterval(() => {
            if (this.connected || retries >= this.MAX_RETRIES) {
                if (this.connected) {
                    this.retryFlag = false;
                } else {
                    this.onDisconnectCallback();
                    this.onConnectingCallback(false);
                }
                clearInterval(intervalId);
            } else {
                this.ws.close()
                this.ws = new WebSocket(this.ws.url);
                this.setupWs();
                if (this.listening) {
                    this.listen()
                }
                retries++;
            }
        }, this.RETRY_INTERVAL_MS);
    }
}

export { WSConnection };