import { Router } from "@oak/oak/router";
import { addRouteRoutes } from "./route.ts";
import { addRunRoutes } from "./run.ts";
import { addUserRoutes } from "./user.ts";
import { Database } from "../Database.ts";
import { Sessions } from "../Session.ts";

export function api(router: Router, database: Database, sessions: Sessions) {
    addRouteRoutes(router, database, sessions);
    addUserRoutes(router, database, sessions);
    addRunRoutes(router, database, sessions);
}
