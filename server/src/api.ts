import { Router } from "@oak/oak/router";
import { addRouteRoutes } from "./addRouteRoutes.ts";
import { Database } from "./Database.ts";

export function api(router: Router, database: Database) {
    addRouteRoutes(router, database);
}
