import { UnauthorizedHttpServer } from "./Server.ts";

export function unauthorizedServer() {
    let url;
    if (
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ) {
        url = "http://127.0.0.1:8200";
    } else if (location.hostname === "avarts.tpho.dk") {
        url = "https://avarts.tpho.dk/api";
    } else {
        throw new Error("unhandled case");
    }

    return new UnauthorizedHttpServer(url);
}
