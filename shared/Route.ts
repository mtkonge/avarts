import z from "zod";

export const Coords = z.strictObject({
    latitude: z.number(),
    longitude: z.number(),
});

export const Route = z.strictObject({
    coords: z.array(Coords),
});

export const RouteWithId = Route.extend({
    id: z.number(),
});

export type RouteWithId = z.infer<typeof RouteWithId>;
export type Route = z.infer<typeof Route>;
export type Coords = z.infer<typeof Coords>;
