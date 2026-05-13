import { Coords, type Route } from "@avarts/shared";
import { Geolocator } from "./Geolocator.ts";

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

    public stop(): Route {
        if (!this.recordingLoopId) {
            throw new Error("called stop without start");
        }
        clearInterval(this.recordingLoopId);
        this.recordingLoopId = null;
        return { coords: [...this.currentRecording] };
    }
}
