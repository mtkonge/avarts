import { type Route } from "./Route.ts";

export interface Database {
    getRouteById(id: number): Promise<Route>;
    addRoute(route: Route): Promise<void>;
    getAllRoutes(): Promise<Route[]>;
}
