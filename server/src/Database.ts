import { Result as InnerResult } from "./Result.ts";
import { type Route } from "./Route.ts";

export type Result<T> = InnerResult<T, string>;

export interface Database {
    getRouteById(id: number): Promise<Result<Route>>;
    addRoute(route: Route): Promise<Result<void>>;
    getAllRoutes(): Promise<Result<Route[]>>;
}
