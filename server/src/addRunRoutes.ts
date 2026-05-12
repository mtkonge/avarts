import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import { Sessions } from "./Session.ts";
import {
    AddRunRequest,
    AddRunResponse,
    CheckpointsReachedForRunOnRoute,
} from "@avarts/shared";
import { validateResponse } from "./validateResponse.ts";

export function addRunRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post(
        "/add-run",
        validateResponse(AddRunResponse, async (ctx) => {
            const parsedResult = AddRunRequest.safeParse(ctx.request.body);

            if (!parsedResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: parsedResult.error,
                };
                return;
            }

            const userIdResult = sessions.userIdFromToken(
                parsedResult.data.token,
            );

            if (!userIdResult.ok) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid token",
                };
                return;
            }

            const routeResult = await database.getRouteById(
                parsedResult.data.run.routeId,
            );

            if (!routeResult.ok) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid route",
                };
                return;
            }

            if (
                CheckpointsReachedForRunOnRoute(
                    parsedResult.data.run,
                    routeResult.data,
                ) !== routeResult.data.coords.length
            ) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid run",
                };
                return;
            }

            const dbResult = await database.addRun(
                parsedResult.data.run,
                userIdResult.data,
            );

            if (!dbResult.ok) {
                ctx.response.status = 500;
                ctx.response.body = {
                    success: false,
                    error: dbResult.error,
                };
                return;
            }

            ctx.response.body = {
                success: true,
            };
        }),
    );
}
