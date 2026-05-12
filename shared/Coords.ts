import z from "zod";

export const Coords = z.strictObject({
    latitude: z.number(),
    longitude: z.number(),
});

export type Coords = z.infer<typeof Coords>;
