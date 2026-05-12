import * as z from "zod";
import type { Route } from "@avarts/shared";
import type { Coords } from "./Coords.ts";

export const Run = z.strictObject({
    routeId: z.number(),
    timeInMilliseconds: z.number(),
    coords: z.strictObject({
        longitude: z.number(),
        latitude: z.number(),
    }).array(),
});

export const RunWithUserIdAndId = Run.extend({
    id: z.number(),
    userId: z.number(),
});

export type Run = z.infer<typeof Run>;
export type RunWithUserIdAndId = z.infer<typeof RunWithUserIdAndId>;

function distanceFromLineToPoint(
    from: Coords,
    to: Coords,
    point: Coords,
): number {
    /*
    Formular used
    https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
    */
    return Math.abs(
        (to.longitude - from.longitude) * point.latitude -
            (to.latitude - from.latitude) * point.longitude +
            to.latitude * from.longitude - to.longitude * from.latitude,
    ) /
        Math.sqrt(
            Math.pow(to.longitude - from.longitude, 2) +
                Math.pow(to.latitude - from.latitude, 2),
        );
}

function longitudeMetersToDegrees(meters: number, longitude: number): number {
    const earthRadiusInMeters = 6378000;
    const metersPerDegree = (Math.PI / 180) * earthRadiusInMeters *
        Math.cos(longitude * Math.PI / 180);
    return meters * metersPerDegree;
}

export function CheckpointsReachedForRunOnRoute(
    run: Run,
    route: Route,
): number {
    if (route.coords.length <= 1) {
        throw new Error("Route should have more than 1 coordinate");
    }
    const checkpointsLeft = structuredClone(route.coords);
    let currentLocation = checkpointsLeft.shift()!;
    const checkpointRadius = longitudeMetersToDegrees(
        5,
        currentLocation.longitude,
    );
    for (let i = 0; i < run.coords.length; i++) {
        while (true) {
            if (
                distanceFromLineToPoint(
                    currentLocation,
                    run.coords[i],
                    checkpointsLeft[0],
                ) >= checkpointRadius
            ) {
                break;
            }

            if (checkpointsLeft.shift() === undefined) {
                return route.coords.length;
            }
        }
        currentLocation = run.coords[i];
    }

    return route.coords.length - checkpointsLeft.length;
}
