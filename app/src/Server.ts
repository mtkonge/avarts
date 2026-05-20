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
    RoutesRequest,
    RoutesResponse,
    type RouteWithUserIdAndId,
    RunsOnRouteRequest,
    RunsOnRouteResponse,
    RunWithUserIdAndId,
    User,
    UserRequest,
    UserResponse,
} from "@avarts/shared";
import z from "zod";

export interface UnauthorizedServer {
    runsOnRoute(
        request: RunsOnRouteRequest,
    ): Promise<Result<RunWithUserIdAndId[], string>>;
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

const ReqResMap = {
    "/register": { req: RegisterRequest, res: RegisterResponse },
    "/login": { req: LoginRequest, res: LoginResponse },
    "/add-route": { req: AddRouteRequest, res: AddRouteResponse },
    "/logout": { req: LogoutRequest, res: LogoutResponse },
    "/user": { req: UserRequest, res: UserResponse },
    "/add-run": { req: AddRunRequest, res: AddRunResponse },
    "/runs-on-route": { req: RunsOnRouteRequest, res: RunsOnRouteResponse },
    "/route": { req: RouteRequest, res: RouteResponse },
    "/routes": { req: RoutesRequest, res: RoutesResponse },
} as const;

type ReqResMap = typeof ReqResMap;
type ApiRoutes = keyof ReqResMap;
type Req<ApiRoute extends ApiRoutes> = z.infer<ReqResMap[ApiRoute]["req"]>;
type Res<ApiRoute extends ApiRoutes> = z.infer<ReqResMap[ApiRoute]["res"]>;

abstract class BaseHttpServer {
    constructor(protected serverUrl: string) {
        if (serverUrl.endsWith("/")) {
            throw new Error(
                `contract broken: ${this.serverUrl} ends with '/'`,
            );
        }
    }
    protected async postRequest<ApiRoute extends ApiRoutes>(
        route: ApiRoute,
        data: Req<ApiRoute>,
    ): Promise<Res<ApiRoute>> {
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
            .then((x) => {
                const y = ReqResMap[route].res.parse(x);
                // TODO: pls fix :(
                return y as Res<ApiRoute>;
            });
    }
}

export class UnauthorizedHttpServer extends BaseHttpServer
    implements UnauthorizedServer {
    constructor(serverUrl: string) {
        super(serverUrl);
    }
    async runsOnRoute(
        request: RunsOnRouteRequest,
    ): Promise<Result<RunWithUserIdAndId[], string>> {
        const body = await this.postRequest(
            "/runs-on-route",
            request,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }
    async route(
        request: RouteRequest,
    ): Promise<Result<RouteWithUserIdAndId, string>> {
        const body = await this.postRequest("/route", request);
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async routes(): Promise<Result<RouteWithUserIdAndId[], string>> {
        const body = await this.postRequest("/routes", null);
        if (!body.success) {
            return err(body.error);
        }
        return ok(body.data);
    }

    async register(
        request: RegisterRequest,
    ): Promise<Result<void, string>> {
        const body = await this.postRequest(
            "/register",
            request,
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }

    async login(
        request: LoginRequest,
    ): Promise<Result<string, string>> {
        const body = await this.postRequest("/login", request);
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
            "/add-route",
            { token: this.token, ...request },
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
            "/logout",
            { token: this.token, ...request },
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
            "/user",
            { token: this.token, ...request },
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
            "/add-run",
            { token: this.token, ...request },
        );
        if (!body.success) {
            return err(body.error);
        }
        return ok();
    }
}
