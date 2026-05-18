import { RouterContext } from "@oak/oak/router";
import z from "zod";

export type Pmr<Res> = Promise<{ body: Res; status?: number }>;

type Handler<Req, Res> = (req: Req) => Pmr<Res>;

export function parse<
    RequestSchema extends z.ZodType<object>,
    ResponseSchema extends z.ZodType<object>,
>(
    requestSchema: RequestSchema,
    responseSchema: ResponseSchema,
    functor: Handler<z.output<RequestSchema>, z.output<ResponseSchema>>,
): (ctx: RouterContext<string>) => Promise<void> {
    return async (ctx) => {
        const request = requestSchema.safeParse(await ctx.request.body.json());
        if (!request.success) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: request.error.message,
            };
            return;
        }
        const res = await functor(request.data);
        try {
            const body = responseSchema.parse(res.body);
            ctx.response.status = res.status ?? 200;
            ctx.response.body = body;
        } catch (err) {
            console.error(res.body);
            console.error(err);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "internal server error",
            };
        }
    };
}
