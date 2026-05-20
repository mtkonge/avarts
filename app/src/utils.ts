import {
    AuthorizedHttpServer,
    AuthorizedServer,
    UnauthorizedHttpServer,
    UnauthorizedServer,
} from "./Server.ts";

function url() {
    if (
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ) {
        return "http://127.0.0.1:8200";
    } else if (location.hostname === "avarts.tpho.dk") {
        return "https://avarts.tpho.dk/api";
    } else {
        throw new Error("unhandled case");
    }
}

export async function unauthorizedServer(): Promise<UnauthorizedServer> {
    return await Promise.resolve(new UnauthorizedHttpServer(url()));
}

export async function authorizedServer(): Promise<AuthorizedServer> {
    const token = localStorage.getItem("token");
    if (token === null) {
        location.href = "/login.html";
        throw new Error("unreachable - href set (no token)");
    }
    const server = new AuthorizedHttpServer(url(), token);
    const user = await server.user({});
    if (!user.ok || user.ok && user.data === null) {
        location.href = "/login.html";
        throw new Error("unreachable - href set");
    }
    return server;
}

export const html = <T>(strings: TemplateStringsArray, ...values: T[]) =>
    String.raw({ raw: strings }, ...values);
