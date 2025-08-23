
class User {
    id: string;
    username: string;
    createdAt: Date;

    constructor(id: string, username: string, createdAt: Date) {
        this.id = id;
        this.username = username;
        this.createdAt = createdAt;
    }

    static fromJson(json: any): User {
        return new User(json.id, json.username, json.createdAt);
    }
}

export default User;