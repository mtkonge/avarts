import {
    Result as InnerResult,
    RouteWithUserId,
    RouteWithUserIdAndId,
    Run,
    UserWithPassword,
    UserWithPasswordAndId,
} from "@avarts/shared";

export type Result<T> = InnerResult<T, string>;

export interface Database {
    getRouteById(id: number): Promise<Result<RouteWithUserIdAndId | null>>;
    addRoute(route: RouteWithUserId): Promise<Result<void>>;
    getAllRoutes(): Promise<Result<RouteWithUserIdAndId[]>>;
    getUserById(id: number): Promise<Result<UserWithPasswordAndId>>;
    getUserByUsername(
        username: string,
    ): Promise<Result<UserWithPasswordAndId | null>>;
    addUser(user: UserWithPassword): Promise<Result<void>>;
    addRun(run: Run, userId: number): Promise<Result<void>>;
}
