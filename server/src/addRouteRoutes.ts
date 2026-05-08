import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import * as z from "zod";
import { Route } from "@avarts/shared";
import { Status } from "@oak/commons/status";

const AddRouteRequest = z.strictObject({
    route: Route,
});

export function addRouteRoutes(router: Router, database: Database) {
    router.get("/route/:id", async (ctx) => {
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
            ctx.response.status = Status.InternalServerError;
        }
    });

    router.get("/routes", async (ctx) => {
        const result = await database.getAllRoutes();

        if (result.ok) {
            ctx.response.body = { success: true, data: result.data };
        } else {
            ctx.response.body = { success: false, error: result.error };
            ctx.response.status = Status.InternalServerError;
        }
    });
}
