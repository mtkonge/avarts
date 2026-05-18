import {
    AddRouteRequest,
    AddRouteResponse,
    AddRunRequest,
    AddRunResponse,
    err,
    Forget,
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

export interface UnauthorizedServer {
    routes(): Promise<Result<RouteWithUserIdAndId[], string>>;
    register(
        request: RegisterRequest,
    ): Promise<Result<void, string>>;
    login(
        request: LoginRequest,
    ): Promise<Result<string, string>>;
}

export interface AuthorizedServer extends UnauthorizedServer {
    addRoute(
        request: Forget<AddRouteRequest, "token">,
    ): Promise<Result<void, string>>;
    logout(
        request: Forget<LogoutRequest, "token">,
    ): Promise<Result<void, string>>;
    user(
        request: Forget<UserRequest, "token">,
    ): Promise<Result<User | null, string>>;
    addRun(
        request: Forget<AddRunRequest, "token">,
    ): Promise<Result<void, string>>;
}

type Requests =
    | RegisterRequest
    | LoginRequest
    | AddRouteRequest
    | LogoutRequest
    | UserRequest
    | AddRunRequest;

abstract class BaseHttpServer {
    constructor(protected serverUrl: string) {}
    protected async postRequest(
        data: Requests | null,
        route: string,
    ) {
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
}

export class UnauthorizedHttpServer extends BaseHttpServer
    implements UnauthorizedServer {
    constructor(serverUrl: string) {
        super(serverUrl);
    }

    async routes(): Promise<Result<RouteWithUserIdAndId[], string>> {
        const body: RoutesResponse =
            await (await this.postRequest(null, `${this.serverUrl}/routes`))
                .json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
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
}

export class AuthorizedHttpServer extends UnauthorizedHttpServer
    implements AuthorizedServer {
    constructor(serverUrl: string, public readonly token: string) {
        super(serverUrl);
    }

    async addRoute(
        request: Forget<AddRouteRequest, "token">,
    ): Promise<Result<void, string>> {
        const body: AddRouteResponse = await (await this.postRequest(
            { token: this.token, ...request },
            "/add-route",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async logout(
        request: Forget<LogoutRequest, "token">,
    ): Promise<Result<void, string>> {
        const body: LogoutResponse = await (await this.postRequest(
            { token: this.token, ...request },
            "/logout",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async user(
        request: Forget<UserRequest, "token">,
    ): Promise<Result<User | null, string>> {
        const body: UserResponse = await (await this.postRequest(
            { token: this.token, ...request },
            "/user",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async addRun(
        request: Forget<AddRunRequest, "token">,
    ): Promise<Result<void, string>> {
        const body: AddRunResponse = await (await this.postRequest(
            { token: this.token, ...request },
            "/add-run",
        )).json();
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }
}
