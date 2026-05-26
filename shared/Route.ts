import * as z from "zod";
import { Coords } from "./Coords.ts";

export const Route = z.strictObject({
    name: z.string(),
    coords: z.array(Coords),
});

export const RouteWithUserId = Route.extend({
    userId: z.number(),
});

export const RouteWithUserIdAndId = Route.extend({
    userId: z.number(),
    id: z.number(),
});

export type RouteWithUserId = z.infer<typeof RouteWithUserId>;
export type RouteWithUserIdAndId = z.infer<typeof RouteWithUserIdAndId>;
export type Route = z.infer<typeof Route>;
