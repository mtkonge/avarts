import * as z from "zod";

export const Coords = z.strictObject({
    latitude: z.number(),
    longitude: z.number(),
});

export const Route = z.strictObject({
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
export type Coords = z.infer<typeof Coords>;
