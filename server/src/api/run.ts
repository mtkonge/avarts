import { Router } from "@oak/oak/router";
import { Database } from "../Database.ts";
import { Sessions } from "../Session.ts";
import {
    AddRunRequest,
    AddRunResponse,
    assertUnreachable,
} from "@avarts/shared";
import { parse, Pmr } from "./parserMiddleware.ts";
import * as beeswax from "../beeswax/mod.ts";

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
                const result = await beeswax.addRun(req, database, sessions);
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
}
