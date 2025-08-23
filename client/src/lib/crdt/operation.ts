
import { ChrPosition } from "@/lib/crdt/character";

enum OperationType {
    Insert = "INSERT",
    Delete = "DELETE"
}

function parseOperationType(typeStr: string) {
    if (typeStr == "INSERT") {
        return OperationType.Insert
    } else if (typeStr == "DELETE") {
        return OperationType.Delete
    } else {
        throw Error("Unsupported type")
    }
}

class Operation {
    type: OperationType;
    documentId: string;
    chrId: string;
    value: string;
    clientId: string;
    position: ChrPosition;
    counter: number;

    constructor(
        type: OperationType,
        documentId: string,
        chrId: string,
        value: string,
        clientId: string,
        position: ChrPosition,
        counter: number
    ) {
        this.type = type;
        this.documentId = documentId;
        this.chrId = chrId;
        this.value = value;
        this.clientId = clientId;
        this.position = position;
        this.counter = counter;
    }

    toJSON(): any {
        return {
            type: this.type.toString(),
            documentId: this.documentId,
            chrId: this.chrId,
            value: this.value,
            clientId: this.clientId,
            position: this.position,
            counter: this.counter
        };
    }

    static fromJSON(json: any): Operation {
        return new Operation(
            parseOperationType(json.type),
            json.documentId,
            json.chrId,
            json.value,
            json.clientId,
            json.position,
            json.counter
        )
    }
}


export { Operation, OperationType };