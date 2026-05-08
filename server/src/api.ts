import { Router } from "@oak/oak/router";
import { addRouteRoutes } from "./addRouteRoutes.ts";
import { addUserRoutes } from "./addUserRoutes.ts";
import { Database } from "./Database.ts";
import { Sessions } from "./Session.ts";

export function api(router: Router, database: Database, sessions: Sessions) {
    addRouteRoutes(router, database, sessions);
    addUserRoutes(router, database, sessions);
}
