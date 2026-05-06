import { Router } from "@oak/oak/router";
import { addRouteRoutes } from "./addRouteRoutes.ts";

export function api(router: Router) {
    addRouteRoutes(router);
}
