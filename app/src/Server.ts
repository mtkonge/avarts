import {
    AddRouteRequest,
    AddRouteResponse,
    err,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    ok,
    RegisterRequest,
    RegisterResponse,
    type Result,
    RoutesResponse,
    type RouteWithUserIdAndId,
    User,
    UserRequest,
    UserResponse,
} from "@avarts/shared";

export interface Server {
    routes(): Promise<Result<RouteWithUserIdAndId[], string>>;
    addRoute(request: AddRouteRequest): Promise<Result<void, string>>;
    register(
        request: RegisterRequest,
    ): Promise<Result<void, string>>;
    login(
        request: LoginRequest,
    ): Promise<Result<string, string>>;
    logout(request: LogoutRequest): Promise<Result<void, string>>;
    user(request: UserRequest): Promise<Result<User | null, string>>;
}

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
        const body: RoutesResponse =
            await (await fetch(`${this.serverUrl}/routes`))
                .json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async addRoute(request: AddRouteRequest): Promise<Result<void, string>> {
        const body: AddRouteResponse =
            await (await this.postRequest(request, "/add-route")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async register(
        request: RegisterRequest,
    ): Promise<Result<void, string>> {
        const body: RegisterResponse =
            await (await this.postRequest(request, "/register")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async login(
        request: LoginRequest,
    ): Promise<Result<string, string>> {
        const body: LoginResponse =
            await (await this.postRequest(request, "/login")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.token);
    }

    async logout(request: LogoutRequest): Promise<Result<void, string>> {
        const body: LogoutResponse =
            await (await this.postRequest(request, "/logout")).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async user(request: UserRequest): Promise<Result<User | null, string>> {
        const body: UserResponse = await (await this.postRequest(
            request,
            "/user",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }
}
