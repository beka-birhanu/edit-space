
export type ChrPosition = number[];

class Character {
    id: string;
    documentId: string;
    position: ChrPosition;
    value: string;

    constructor(id: string, documentId: string, position: ChrPosition, value: string) {
        this.id = id;
        this.documentId = documentId;
        this.position = position;
        this.value = value;
    }

    static fromJSON(json: any): Character {
        return new Character(json.id, json.documentId, json.position, json.value);
    }

    toJSON(): any {
        return {
            id: this.id,
            position: this.position,
            value: this.value
        };
    }
}

export default Character;