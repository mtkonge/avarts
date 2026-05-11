import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import { Status } from "@oak/commons/status";
import { Sessions } from "./Session.ts";
import {
    AddRouteRequest,
    AddRouteResponse,
    RouteResponse,
    RoutesResponse,
} from "@avarts/shared";
import { validateResponse } from "./validateResponse.ts";

export function addRouteRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.get(
        "/route/:id",
        validateResponse(RouteResponse, async (ctx) => {
            const id = parseInt(ctx.params.id);
            const result = await database.getRouteById(id);
            if (result.ok) {
                ctx.response.body = { success: true, data: result.data };
            } else {
                ctx.response.body = { success: false, error: result.error };
                if (result.error == `invalid id ${id}`) {
                    ctx.response.status = Status.NotFound;
                } else {
                    ctx.response.status = Status.InternalServerError;
                }
            }
        }),
    );

    router.post(
        "/add-route",
        validateResponse(AddRouteResponse, async (ctx) => {
            const raw = await ctx.request.body.json();
            const parsedResult = AddRouteRequest.safeParse(raw);
            if (!parsedResult.success) {
                ctx.response.body = {
                    success: false,
                    error: parsedResult.error,
                };
                return;
            }

            if (!parsedResult.data.token) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid session",
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
                    error: "invalid session",
                };
                return;
            }

            const route = parsedResult.data.route;
            const dbResult = await database.addRoute({
                ...route,
                userId: userIdResult.data,
            });
            if (dbResult.ok) {
                ctx.response.body = { success: true };
            } else {
                ctx.response.body = { success: false, error: dbResult.error };
                ctx.response.status = Status.InternalServerError;
            }
        }),
    );

    router.get(
        "/routes",
        validateResponse(RoutesResponse, async (ctx) => {
            const result = await database.getAllRoutes();

            if (result.ok) {
                ctx.response.body = { success: true, data: result.data };
            } else {
                ctx.response.body = { success: false, error: result.error };
                ctx.response.status = Status.InternalServerError;
            }
        }),
    );
}
