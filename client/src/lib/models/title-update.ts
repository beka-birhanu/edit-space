
class TitleUpdate {
    constructor(
        public documentId: string,
        public clientId: string,
        public title: string
    ) {}

    static fromJSON(json: any) {
        return new TitleUpdate(
            json.documentId,
            json.clientId,
            json.title
        )
    }

    toJson() {
        return {
            documentId: this.documentId,
            clientId: this.clientId,
            title: this.title
        }
    }
}

export default TitleUpdate;
