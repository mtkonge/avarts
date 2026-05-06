import { type Route } from "./Route.ts";

export interface Database {
    getRouteById(id: number): Route;
    addRoute(route: Route): void;
    getAllRoutes(): Route[];
}
