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

function closestPointOnLineToPoint(
    from: Coords,
    to: Coords,
    point: Coords,
): Coords {
    const [fx, fy, tx, ty] = [
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude,
    ];

    const [px, py] = [
        point.latitude,
        point.longitude,
    ];

    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_line_equations
    // normal vector = -dx/dy

    let line;
    {
        const delta = {
            y: ty - fy,
            x: tx - fx,
        };
        const slope = delta.y / delta.x;
        const intersection = fy - slope * fx;
        line = { a: slope, c: intersection };
    }

    let normal;
    {
        const delta = {
            y: ty - fy,
            x: tx - fx,
        };
        const slope = -(delta.x / delta.y);
        const intersection = py - slope * px;
        normal = { b: slope, d: intersection };
    }

    const { a, b, c, d } = { ...line, ...normal };

    const x = (d - c) / (a - b);
    const y = a * x + c;
    return { latitude: x, longitude: y };
}

function pointDistance(a: Coords, b: Coords): number {
    return Math.sqrt(
        (a.longitude - b.longitude) ** 2 +
            (a.latitude - b.latitude) ** 2,
    );
}

function distanceFromLineSegmentToPoint(
    from: Coords,
    to: Coords,
    point: Coords,
): number {
    const closest = closestPointOnLineToPoint(from, to, point);

    const minLat = Math.min(from.latitude, to.latitude);
    const maxLat = Math.max(from.latitude, to.latitude);

    const minLng = Math.min(from.longitude, to.longitude);
    const maxLng = Math.max(from.longitude, to.longitude);

    const distances = [from, to].map((x) => pointDistance(x, point));
    const closestDistance = Math.min(...distances);
    if (closest.longitude < minLng || closest.longitude > maxLng) {
        return closestDistance;
    }
    if (closest.latitude < minLat || closest.latitude > maxLat) {
        return closestDistance;
    }
    return pointDistance(closest, point);
}

function latitudeMetersToDegrees(
    meters: number,
): number {
    const metersInADegree = 111320;
    return meters / metersInADegree;
}

const checkpointRadius = latitudeMetersToDegrees(5);

export function targetCheckpointIndex(
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
        const dist = distanceFromLineSegmentToPoint(
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

export function timeForRun(
    finishedRun: Run,
    route: Route,
): number {
    const run = structuredClone(finishedRun);
    const coords = run.coords.splice(1, Infinity);
    for (const coord of coords) {
        console.log(
            `lat=${coord.latitude.toFixed(10)},lng=${
                coord.longitude.toFixed(10)
            }`,
        );
    }
    console.log(structuredClone(coords));
    let startOffset = null;
    let endOffset = null;
    while (true) {
        const newest = coords.shift();
        if (newest === undefined) break;
        run.coords.push(newest);
        const targetCheckpoint = targetCheckpointIndex(run, route);
        if (targetCheckpoint > 0 && startOffset === null) {
            startOffset = newest.startOffset;
        }
        console.log(targetCheckpoint, run.coords.length);
        if (targetCheckpoint === route.coords.length && endOffset === null) {
            endOffset = newest.startOffset;
            break;
        }
    }
    if (startOffset === null || endOffset === null) {
        console.log(startOffset, endOffset);
        throw new Error("contract broken: given unfinished run");
    }
    return endOffset - startOffset;
}

if (import.meta.main) {
    (() => {
        const coords = [
            { "latitude": 56.4654627, "longitude": 9.411863 },
            { "latitude": 56.4654613, "longitude": 9.4118627 },
            { "latitude": 56.4654593, "longitude": 9.4118624 },
            { "latitude": 56.4654526, "longitude": 9.4118558 },
            { "latitude": 56.4654394, "longitude": 9.4118293 },
            { "latitude": 56.4654282, "longitude": 9.4117896 },
            { "latitude": 56.4654275, "longitude": 9.4117794 },
            { "latitude": 56.465427, "longitude": 9.4117558 },
            { "latitude": 56.4654248, "longitude": 9.4117344 },
            { "latitude": 56.465421, "longitude": 9.4117063 },
            { "latitude": 56.4654217, "longitude": 9.4116958 },
            { "latitude": 56.4654235, "longitude": 9.4116642 },
            { "latitude": 56.4654206, "longitude": 9.4116369 },
            { "latitude": 56.4654203, "longitude": 9.4116305 },
            { "latitude": 56.4654229, "longitude": 9.411608 },
            { "latitude": 56.4654239, "longitude": 9.4115978 },
            { "latitude": 56.4654258, "longitude": 9.4115792 },
            { "latitude": 56.4654263, "longitude": 9.4115612 },
            { "latitude": 56.4654286, "longitude": 9.4115397 },
            { "latitude": 56.4654328, "longitude": 9.4115266 },
            { "latitude": 56.4654471, "longitude": 9.4115087 },
            { "latitude": 56.4654506, "longitude": 9.4115003 },
            { "latitude": 56.4654579, "longitude": 9.4114821 },
            { "latitude": 56.4654575, "longitude": 9.4114779 },
        ];
        function statusOfRun(run: Run) {
            const index = targetCheckpointIndex(run, { coords });
            console.log(`index=${index}`);
        }
        const run = {
            coords: [] as Run["coords"],
            routeId: -1,
            startTime: 0,
        } satisfies Run;
        statusOfRun(run);
        console.log("starting run");
        let i = 0;
        for (const coord of coords) {
            run.coords.push({ ...coord, startOffset: i });
            statusOfRun(run);
            i += 5000;
        }
        console.log(timeForRun(run, { coords }));
    })();
}
