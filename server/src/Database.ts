import { Result as InnerResult, type RouteWithId } from "@avarts/shared";

export type Result<T> = InnerResult<T, string>;

export interface Database {
    getRouteById(id: number): Promise<Result<RouteWithId>>;
    addRoute(route: Omit<RouteWithId, "id">): Promise<Result<void>>;
    getAllRoutes(): Promise<Result<RouteWithId[]>>;
}
