import type { Router } from "@oak/oak/router";
import type { Database } from "../Database.ts";
import type { Sessions } from "../Session.ts";
import {
    AddRouteRequest,
    AddRouteResponse,
    assertUnreachable,
    DeleteRouteRequest,
    DeleteRouteResponse,
    RouteRequest,
    RouteResponse,
    RoutesRequest,
    RoutesResponse,
} from "@avarts/shared";
import { parse, type Pmr } from "./parserMiddleware.ts";
import * as businessLogic from "../business_logic/mod.ts";

export function addRouteRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post(
        "/route",
        parse(
            RouteRequest,
            RouteResponse,
            async (req): Pmr<RouteResponse> => {
                const result = await businessLogic.routeWithId(
                    req,
                    database,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "bad_id":
                            return {
                                status: 404,
                                body: { success: false, error: "not found" },
                            };
                        case "db_error":
                            return {
                                status: 500,
                                body: {
                                    success: false,
                                    error: "db error",
                                },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return {
                    body: { success: true, route: result.data.route },
                };
            },
        ),
    );

    router.post(
        "/add-route",
        parse(
            AddRouteRequest,
            AddRouteResponse,
            async (req): Pmr<AddRouteResponse> => {
                const result = await businessLogic.addRoute(
                    req,
                    database,
                    sessions,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "bad_login":
                            return {
                                status: 400,
                                body: { success: false, error: "bad login" },
                            };
                        case "bad_name":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "bad name",
                                },
                            };
                        case "db_error":
                            return {
                                status: 500,
                                body: {
                                    success: false,
                                    error: "db error",
                                },
                            };

                        default:
                            assertUnreachable(result);
                    }
                }
                return {
                    body: { success: true },
                };
            },
        ),
    );

    router.post(
        "/delete-route",
        parse(
            DeleteRouteRequest,
            DeleteRouteResponse,
            async (req): Pmr<AddRouteResponse> => {
                const result = await businessLogic.deleteRoute(
                    req,
                    database,
                    sessions,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "bad_id":
                            return {
                                status: 400,
                                body: { success: false, error: "bad id" },
                            };
                        case "bad_user": {
                            return {
                                status: 400,
                                body: { success: false, error: "bad user" },
                            };
                        }
                        case "bad_login":
                            return {
                                status: 400,
                                body: { success: false, error: "bad login" },
                            };
                        case "db_error":
                            return {
                                status: 500,
                                body: {
                                    success: false,
                                    error: "db error",
                                },
                            };

                        default:
                            assertUnreachable(result);
                    }
                }
                return {
                    body: { success: true },
                };
            },
        ),
    );

    router.post(
        "/routes",
        parse(
            RoutesRequest,
            RoutesResponse,
            async (): Pmr<RoutesResponse> => {
                const result = await businessLogic.allRoutes(database);

                if (!result.ok) {
                    switch (result.error) {
                        case "db_error":
                            return {
                                status: 500,
                                body: {
                                    success: false,
                                    error: "db error",
                                },
                            };
                        default:
                            assertUnreachable(result.error);
                    }
                }

                return {
                    status: 200,
                    body: { success: true, routes: result.data.routes },
                };
            },
        ),
    );
}
