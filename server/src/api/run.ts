import type { Router } from "@oak/oak/router";
import type { Database } from "../Database.ts";
import type { Sessions } from "../Session.ts";
import {
    AddRunRequest,
    AddRunResponse,
    assertUnreachable,
    RunsOnRouteRequest,
    RunsOnRouteResponse,
} from "@avarts/shared";
import { parse, type Pmr } from "./parserMiddleware.ts";
import * as businessLogic from "../business_logic/mod.ts";

export function addRunRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post(
        "/add-run",
        parse(
            AddRunRequest,
            AddRunResponse,
            async (req): Pmr<AddRunResponse> => {
                const result = await businessLogic.addRun(
                    req,
                    database,
                    sessions,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "db_error":
                            return {
                                status: 500,
                                body: { success: false, error: "db error" },
                            };
                        case "bad_route":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid route",
                                },
                            };
                        case "unfinished_run":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "unfinished run",
                                },
                            };
                        case "bad_login":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid login",
                                },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return { body: { success: true } };
            },
        ),
    );
    router.post(
        "/runs-on-route",
        parse(
            RunsOnRouteRequest,
            RunsOnRouteResponse,
            async (req): Pmr<RunsOnRouteResponse> => {
                const result = await businessLogic.runsOnRoute(
                    req,
                    database,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "db_error":
                            return {
                                status: 500,
                                body: { success: false, error: "db error" },
                            };
                        case "bad_route":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid route",
                                },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return { body: { success: true, runs: result.data } };
            },
        ),
    );
}
