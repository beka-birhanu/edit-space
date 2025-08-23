
class IncomingCursorUpdate {
    start: number;
    length: number;
    username: string;
    color: string;
    clientId: string;

    constructor(start: number, length: number, username: string, color: string, clientId: string){
        this.start = start;
        this.length = length;
        this.username = username;
        this.color = color;
        this.clientId = clientId;
    }

    static fromJSON(json: any): IncomingCursorUpdate {
        return new IncomingCursorUpdate(json.start, json.length, json.username, json.color, json.clientId);
    }

    toJSON(): any {
        return {
            start: this.start,
            length: this.length,
            username: this.username,
            color: this.color,
            clientId: this.clientId
        };
    }
}

class OutgoingCursorUpdate {
    start: number;
    length: number;
    color: string;

    constructor(start: number, length: number, color: string) {
        this.start = start;
        this.length = length;
        this.color = color;
    }

    static fromJSON(json: any): OutgoingCursorUpdate {
        return new OutgoingCursorUpdate(json.start, json.length, json.color);
    }

    toJSON(): any {
        return {
            start: this.start,
            length: this.length,
            color: this.color
        };
    }
}

export { IncomingCursorUpdate, OutgoingCursorUpdate };