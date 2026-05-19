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
    RouteRequest,
    RouteResponse,
    RoutesResponse,
    type RouteWithUserIdAndId,
    User,
    UserRequest,
    UserResponse,
} from "@avarts/shared";
import z from "zod";

export interface UnauthorizedServer {
    routes(): Promise<Result<RouteWithUserIdAndId[], string>>;
    route(request: RouteRequest): Promise<Result<RouteWithUserIdAndId, string>>;
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
    | AddRunRequest
    | RouteRequest;

abstract class BaseHttpServer {
    constructor(protected serverUrl: string) {
        throw new Error(
            `contract broken: ${this.serverUrl} ends with '/'`,
        );
    }
    protected async postRequest<Res>(
        data: Requests | null,
        route: string,
        response: z.ZodType<Res>,
    ): Promise<Res> {
        if (!route.startsWith("/")) {
            throw new Error(
                `contract broken: ${route} does not start with '/'`,
            );
        }
        const body = JSON.stringify(data);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const method = "POST";
        return await fetch(`${this.serverUrl}${route}`, {
            body,
            headers,
            method,
        })
            .then((x) => x.json())
            .then((x) => response.parse(x));
    }
}

export class UnauthorizedHttpServer extends BaseHttpServer
    implements UnauthorizedServer {
    constructor(serverUrl: string) {
        super(serverUrl);
    }
    async route(
        request: RouteRequest,
    ): Promise<Result<RouteWithUserIdAndId, string>> {
        const body = await this.postRequest(request, `/route`, RouteResponse);
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async routes(): Promise<Result<RouteWithUserIdAndId[], string>> {
        const body = await this.postRequest(null, `/routes`, RoutesResponse);
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async register(
        request: RegisterRequest,
    ): Promise<Result<void, string>> {
        const body = await this.postRequest(
            request,
            "/register",
            RegisterResponse,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async login(
        request: LoginRequest,
    ): Promise<Result<string, string>> {
        const body = await this.postRequest(request, "/login", LoginResponse);
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
        const body = await this.postRequest(
            { token: this.token, ...request },
            "/add-route",
            AddRouteResponse,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async logout(
        request: Forget<LogoutRequest, "token">,
    ): Promise<Result<void, string>> {
        const body = await this.postRequest(
            { token: this.token, ...request },
            "/logout",
            LogoutResponse,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async user(
        request: Forget<UserRequest, "token">,
    ): Promise<Result<User | null, string>> {
        const body = await this.postRequest(
            { token: this.token, ...request },
            "/user",
            UserResponse,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async addRun(
        request: Forget<AddRunRequest, "token">,
    ): Promise<Result<void, string>> {
        const body = await this.postRequest(
            { token: this.token, ...request },
            "/add-run",
            AddRunResponse,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }
}
