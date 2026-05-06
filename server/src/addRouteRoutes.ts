import { Router } from "@oak/oak/router";

export function addRouteRoutes(router: Router) {
    router.get("/route/:id", async (ctx, next) => {
        ctx.response.body = "not implemented";
        await next();
    });

    router.post("/add-route", async (ctx, next) => {
        ctx.response.body = "not implemented";
        await next();
    });
}
