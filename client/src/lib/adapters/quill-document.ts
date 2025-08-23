import { v4 as uuidv4 } from 'uuid';
import { Delta } from "quill/core";
import Document from "@/lib/crdt/document.ts";
import { Operation, OperationType } from "@/lib/crdt/operation.ts";
import Character from "@/lib/crdt/character.ts";

class QuillDocument {
    document: Document;
    clientId: string;
    deleted: Set<string>;

    constructor(document: Document, clientId: string) {
        this.document = document;
        this.clientId = clientId;
        this.deleted = new Set<string>();
    }

    private insert(position: number, value: string, counter: number) {
        const newChar = this.document.insertAtIndex(position, uuidv4(), value);
        const operation = new Operation(
            OperationType.Insert, this.document.id,
            newChar.id, newChar.value, this.clientId,
            newChar.position, counter
        );
        return operation;
    }

    private delete(position: number, counter: number) {
        const deletedChar = this.document.deleteIndex(position);
        const operation = new Operation(
            OperationType.Delete, this.document.id,
            deletedChar.id, deletedChar.value, this.clientId,
            deletedChar.position, counter
        );
        return operation;
    }

    applyOperation(operation: Operation): Delta {
        const delta = new Delta();
        const char = new Character(operation.chrId, this.document.id, operation.position, operation.value)

        if (operation.type === OperationType.Insert) {
            const inserted = this.document.insert(char)
            if (inserted != 0) {
                const idx = this.document.indexOf(char);
                delta.retain(idx);
                delta.insert(operation.value);
            }
        } else if (operation.type === OperationType.Delete) {
            const idx = this.document.indexOf(char)
            const deleted = this.document.delete(char);
            delta.retain(idx)
            delta.delete(deleted);
        }
        return delta;
    }

    applyDelta(delta: Delta, counterStart: number): Operation[] {
        let counter = counterStart;
        let idx = 0;
        const operations: Operation[] = [];

        if (!delta || !delta.ops) return operations;

        for (const op of delta.ops) {
            if (op.retain && typeof op.retain === 'number') {
                idx += op.retain;
            } else if (op.insert && typeof op.insert === 'string') {
                for (let i = 0; i < op.insert.length; i++) {
                    const operation = this.insert(idx, op.insert[i], counter);
                    operations.push(operation);
                    counter++;
                    idx++;
                }
            } else if (op.delete) {
                for (let i = 0; i < op.delete; i++) {
                    const operation = this.delete(idx, counter);
                    operations.push(operation);
                    counter++;
                }
            }
        }

        return operations;
    }
}

export default QuillDocument;