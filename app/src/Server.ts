import {
    err,
    ok,
    type Result,
    type Route,
    type RouteWithUserIdAndId,
} from "@avarts/shared";
export interface Server {
    routes(): Promise<Result<RouteWithUserIdAndId[], string>>;
    addRoute(route: Route): Promise<Result<void, string>>;
}

type Response<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};

export class HttpServer implements Server {
    constructor(private serverUrl: string) {}

    private async postRequest(data: object, route: string) {
        const body = JSON.stringify(data);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const method = "POST";
        return await fetch(`${this.serverUrl}${route}`, {
            body,
            headers,
            method,
        });
    }

    async routes(): Promise<Result<RouteWithUserIdAndId[], string>> {
        const body: Response<RouteWithUserIdAndId[] | string> =
            await (await fetch(`${this.serverUrl}/routes`))
                .json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data as RouteWithUserIdAndId[]);
    }

    async addRoute(route: Route): Promise<Result<void, string>> {
        const body: Response<void | string> =
            await (await this.postRequest(route, "/add-route")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async register(
        username: string,
        password: string,
    ): Promise<Result<void, string>> {
        const data = {
            username,
            password,
        };
        const body: Response<void | string> =
            await (await this.postRequest(data, "/register")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async login(
        username: string,
        password: string,
    ): Promise<Result<void, string>> {
        const data = {
            username,
            password,
        };
        const body: Response<void | string> =
            await (await this.postRequest(data, "/login")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async logout(): Promise<Result<void, string>> {
        const body: Response<void | string> =
            await (await this.postRequest({}, "/logout")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }
}
