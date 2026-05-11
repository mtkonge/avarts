import {
    err,
    ok,
    type Result,
    type Route,
    type RouteWithUserIdAndId,
    User,
} from "@avarts/shared";
export interface Server {
    routes(): Promise<Result<RouteWithUserIdAndId[], string>>;
    addRoute(route: Route): Promise<Result<void, string>>;
    register(
        user: User,
    ): Promise<Result<void, string>>;
    login(
        user: User,
    ): Promise<Result<string, string>>;
    logout(): Promise<Result<void, string>>;
    user(): Promise<Result<User | null, string>>;
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
        user: User,
    ): Promise<Result<void, string>> {
        const body: Response<void | string> =
            await (await this.postRequest(user, "/register")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async login(
        user: User,
    ): Promise<Result<string, string>> {
        const body: Response<string> =
            await (await this.postRequest(user, "/login")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async logout(): Promise<Result<void, string>> {
        const body: Response<void | string> =
            await (await this.postRequest({}, "/logout")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async user(): Promise<Result<User | null, string>> {
        const token = localStorage.getItem("token");
        if (token === null) {
            return err("no token");
        }
        const body: Response<User | null> = await (await this.postRequest(
            {
                token,
            },
            "/user",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }
}
