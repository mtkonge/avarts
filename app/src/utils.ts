import {
    AuthorizedHttpServer,
    type AuthorizedServer,
    UnauthorizedHttpServer,
    type UnauthorizedServer,
} from "./Server.ts";

function redirectToLogin(): Promise<never> {
    location.href = "/login/";
    return new Promise(() => {});
}

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
        return await redirectToLogin();
    }
    const server = new AuthorizedHttpServer(url(), token);
    const user = await server.user({});
    if (!user.ok || user.ok && user.data === null) {
        return await redirectToLogin();
    }
    return server;
}

export const html = (
    strings: ArrayLike<string>,
    ...values: unknown[]
) => String.raw({ raw: strings }, ...values);
