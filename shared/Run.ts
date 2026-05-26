import * as z from "zod";
import { SportId } from "./sports.ts";

export const Run = z.strictObject({
    routeId: z.number(),
    startTime: z.number(),
    coords: z.strictObject({
        longitude: z.number(),
        latitude: z.number(),
        startOffset: z.number(),
    }).array(),
    sport: SportId,
});

export const RunWithUserIdAndId = Run.extend({
    id: z.number(),
    userId: z.number(),
});

export type Run = z.infer<typeof Run>;
export type RunWithUserIdAndId = z.infer<typeof RunWithUserIdAndId>;
