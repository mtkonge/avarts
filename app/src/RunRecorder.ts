import {
    currentCheckpointIndex,
    RouteWithUserIdAndId,
    Run,
} from "@avarts/shared";
import { Geolocator } from "./Geolocator.ts";

export class RunRecorder {
    private run: Run;
    private recordingLoopId: number | null = null;

    constructor(
        private geolocator: Geolocator,
        private route: RouteWithUserIdAndId,
    ) {
        this.run = {
            routeId: route.id,
            startTime: Temporal.Now.instant().epochMilliseconds,
            coords: [],
        };
    }

    public static record(geolocator: Geolocator, route: RouteWithUserIdAndId) {
        const recorder = new RunRecorder(geolocator, route);
        recorder.record();
        return recorder;
    }

    public checkpointIndex(): number {
        return currentCheckpointIndex(this.run, this.route);
    }

    public routeId(): number {
        console.assert(
            typeof this.run.routeId === "number",
            "run.routeId was not a number",
        );
        return this.run.routeId;
    }

    private record() {
        this.recordingLoopId = setInterval(() => {
            const coords = this.geolocator.coords();
            const now = Temporal.Now.instant().epochMilliseconds;
            const startOffset = now - this.run.startTime;

            this.run.coords.push({
                ...coords,
                startOffset,
            });
        }, 100);
    }

    public stop(): Run {
        if (this.recordingLoopId === null) {
            throw new Error("called twice");
        }
        clearInterval(this.recordingLoopId);
        this.recordingLoopId = null;
        return this.run;
    }
}
