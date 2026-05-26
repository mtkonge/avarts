import {
    AuthorizedHttpServer,
    type AuthorizedServer,
    UnauthorizedHttpServer,
    type UnauthorizedServer,
} from "./Server.ts";

function redirectToLogin(): never {
    location.href = "/login/";
    throw new Error("unreachable - href set (no token)");
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
        redirectToLogin();
    }
    const server = new AuthorizedHttpServer(url(), token);
    const user = await server.user({});
    if (!user.ok || user.ok && user.data === null) {
        redirectToLogin();
    }
    return server;
}

export const html = <T>(strings: TemplateStringsArray, ...values: T[]) =>
    String.raw({ raw: strings }, ...values);

function msToDuration(millisecondsTotal: number) {
    const milliseconds = millisecondsTotal % 1000;
    const seconds = (millisecondsTotal - milliseconds) % 60_000;
    const minutes = (millisecondsTotal - seconds - milliseconds) % 3_600_000;
    const hours = (millisecondsTotal - minutes - seconds - milliseconds) %
        86_400_000;
    const days = millisecondsTotal - hours - minutes - seconds - milliseconds;

    return {
        milliseconds,
        seconds: seconds / 1000,
        minutes: minutes / 60_000,
        hours: hours / 3_600_000,
        days: days / 86_400_000,
    };
}

export function formatMs(milliseconds: number) {
    function pad(x: number, count: number = 2) {
        return x.toString().padStart(count, "0");
    }

    const duration = msToDuration(milliseconds);
    let ret = "";
    if (duration.days > 0) {
        ret += `${duration.days}:`;
    }
    if (duration.hours > 0 || ret.length > 0) {
        ret += `${pad(duration.days)}:`;
    }
    if (duration.minutes > 0 || ret.length > 0) {
        ret += `${pad(duration.minutes)}:`;
    }
    ret += `${pad(duration.seconds)}`;
    ret += `.${pad(duration.milliseconds, 3)}`;

    return ret;
}
