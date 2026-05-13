import * as z from "zod";
import type { Route } from "@avarts/shared";
import type { Coords } from "./Coords.ts";

export const Run = z.strictObject({
    routeId: z.number(),
    startTime: z.number(),
    coords: z.strictObject({
        longitude: z.number(),
        latitude: z.number(),
        startOffset: z.number(),
    }).array(),
});

export const RunWithUserIdAndId = Run.extend({
    id: z.number(),
    userId: z.number(),
});

export type Run = z.infer<typeof Run>;
export type RunWithUserIdAndId = z.infer<typeof RunWithUserIdAndId>;

export function distanceFromLineToPoint(
    from: Coords,
    to: Coords,
    point: Coords,
): number {
    /*
    Formular used
    https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
    */
    const over = Math.abs(
        (to.latitude - from.latitude) * point.longitude -
            (to.longitude - from.longitude) * point.latitude +
            to.longitude * from.latitude - to.latitude * from.longitude,
    );
    const under = Math.sqrt(
        Math.pow(to.latitude - from.latitude, 2) +
            Math.pow(to.longitude - from.longitude, 2),
    );
    if (under === 0) {
        return Math.sqrt(
            (from.longitude - point.longitude) ** 2 +
                (from.latitude - point.latitude) ** 2,
        );
    }
    return over / under;
}

export function latitudeMetersToDegrees(
    meters: number,
): number {
    const metersInADegree = 111111;
    return meters / metersInADegree;
}

export const checkpointRadius = latitudeMetersToDegrees(5);

export function currentCheckpointIndex(
    run: Run,
    route: Route,
): number {
    let checkpointIndex = 0;
    let recordingIndex = 1;
    while (true) {
        if (recordingIndex >= run.coords.length) {
            break;
        }
        if (checkpointIndex >= route.coords.length) {
            break;
        }
        const dist = distanceFromLineToPoint(
            run.coords[recordingIndex - 1],
            run.coords[recordingIndex],
            route.coords[checkpointIndex],
        );
        if (dist <= checkpointRadius) {
            checkpointIndex += 1;
        } else {
            recordingIndex += 1;
        }
    }
    return checkpointIndex;
}
