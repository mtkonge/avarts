import type { Coords } from "@avarts/shared";
import type { Geolocator } from "./Geolocator.ts";

export class RouteRecorder {
    private currentRecording: Coords[] = [];
    private recordingLoopId: number | null = null;

    private constructor(private geolocator: Geolocator) {
    }

    public static record(geolocator: Geolocator): RouteRecorder {
        const recorder = new RouteRecorder(geolocator);
        recorder.record();
        return recorder;
    }

    private record() {
        this.currentRecording = [];
        this.recordingLoopId = setInterval(() => {
            const coords = this.geolocator.coords();
            this.currentRecording.push(coords);
        }, 1000);
    }

    public current() {
        return this.currentRecording;
    }

    public stop(): Coords[] {
        if (!this.recordingLoopId) {
            throw new Error("called stop without start");
        }
        clearInterval(this.recordingLoopId);
        this.recordingLoopId = null;
        return [...this.currentRecording];
    }
}
