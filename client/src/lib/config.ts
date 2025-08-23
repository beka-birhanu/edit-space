
const DEFAULTS = {
    baseUrl: "localhost:8080",
    ssl: false
}
class Config {
    static SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL ?? DEFAULTS.baseUrl;
    static SSL = import.meta.env.VITE_SSL === "true";

    static formattedBaseUrl() {
        return `${this.SSL?"https":"http"}://${this.SERVER_BASE_URL}`
    }
}

export default Config;