import { Coords, Geolocator } from "./Geolocator.ts";

export class RouteRecorder {
    private currentRecording: Coords[] = [];
    private recordingLoopId: number | null = null;

    constructor(private geolocator: Geolocator) {
    }

    public record() {
        this.currentRecording = [];
        this.recordingLoopId = setInterval(() => {
            const coords = this.geolocator.coords();
            this.currentRecording.push(coords);
        }, 1000);
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
