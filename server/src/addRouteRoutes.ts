import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import * as z from "zod";
import { RouteWithId } from "@avarts/shared";

const AddRouteRequest = z.strictObject({
    route: RouteWithId,
});

export function addRouteRoutes(router: Router, database: Database) {
    router.get("/route/:id", async (ctx) => {
        const id = parseInt(ctx.params.id);
        const result = await database.getRouteById(id);
        if (result.ok) {
            ctx.response.body = { success: true, data: result.data };
        } else {
            ctx.response.body = { success: false, error: result.error };
        }
    });

    router.post("/add-route", async (ctx) => {
        const raw = await ctx.request.body.json();
        const parseResult = AddRouteRequest.safeParse(raw);
        if (!parseResult.success) {
            ctx.response.body = { success: false, error: parseResult.error };
            return;
        }
        const route = parseResult.data.route;
        const dbResult = await database.addRoute(route);
        if (dbResult.ok) {
            ctx.response.body = { success: true };
        } else {
            ctx.response.body = { success: false, error: dbResult.error };
        }
    });

    router.get("routes", async (ctx) => {
        const result = await database.getAllRoutes();

        if (result.ok) {
            ctx.response.body = { success: true, data: result.data };
        } else {
            ctx.response.body = { success: false, error: result.error };
        }
    });
}
