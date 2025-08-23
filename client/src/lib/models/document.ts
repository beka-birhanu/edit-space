import Character from "@/lib/crdt/character.ts";

interface Doc {
    id: string;
    title: string;
    description: string;
}

export default Doc;

class DocumentInfo {
    id: string;
    title: string;
    createdAt: Date;
    ownerId: string;

    constructor(id: string, title: string, createdAt: Date, ownerId: string) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.ownerId = ownerId;
    }

    static fromJson(json: any) {
        return new DocumentInfo(
            json.id,
            json.title,
            new Date(json.createdAt),
            json.ownerId
        );
    }
}

class DocumentResponse {
    document: DocumentInfo;
    characters: Character[];

    constructor(document: DocumentInfo, characters: Character[]) {
        this.document = document;
        this.characters = characters;
    }

    static fromJson(json: any): DocumentResponse {
        return new DocumentResponse(
            DocumentInfo.fromJson(json.document),
            (json.characters ?? []).map((chr: any) => Character.fromJSON(chr))
        );
    }
}

export { DocumentInfo, DocumentResponse };