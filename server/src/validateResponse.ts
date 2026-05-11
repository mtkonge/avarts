import { RouterContext } from "@oak/oak/router";
import { ResponseBody, ResponseBodyFunction } from "@oak/oak/response";
import z from "zod";

export function validateResponse<T extends ResponseBody | ResponseBodyFunction>(
    schema: z.ZodSchema<T>,
    handler: (
        ctx: RouterContext<string>,
    ) => Promise<void> | void,
) {
    return async (ctx: RouterContext<string>) => {
        await handler(ctx);

        try {
            ctx.response.body = schema.parse(ctx.response.body);
        } catch (_) {
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "internal server error",
            };
        }
    };
}
