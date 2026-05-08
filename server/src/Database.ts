import {
    Result as InnerResult,
    RouteWithUserId,
    RouteWithUserIdAndId,
    User,
    UserWithId,
} from "@avarts/shared";

export type Result<T> = InnerResult<T, string>;

export interface Database {
    getRouteById(id: number): Promise<Result<RouteWithUserIdAndId>>;
    addRoute(route: RouteWithUserId): Promise<Result<void>>;
    getAllRoutes(): Promise<Result<RouteWithUserIdAndId[]>>;
    getUserById(id: number): Promise<Result<UserWithId>>;
    getUserByUsername(username: string): Promise<Result<UserWithId | null>>;
    addUser(user: User): Promise<Result<void>>;
}
