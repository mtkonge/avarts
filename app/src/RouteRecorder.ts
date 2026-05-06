import { type Coord } from "./Coords.ts";
import { type HTMLGeolocationElement } from "./HTMLGeolocationElement.ts";

export class RouteRecorder {
    private currentRecording: Coord[] = [];
    private recordingLoopId: number | null = null;

    constructor(private geolocation: HTMLGeolocationElement) {
    }

    public record() {
        this.currentRecording = [];
        this.recordingLoopId = setInterval(() => {
            if (!this.geolocation.position) {
                return;
            }
            this.currentRecording.push([
                this.geolocation.position.coords.longitude,
                this.geolocation.position.coords.latitude,
            ]);
        }, 1000);
    }

    public stop(): Coord[] {
        if (!this.recordingLoopId) {
            throw new Error("Called stop without start");
        }
        clearInterval(this.recordingLoopId);
        this.recordingLoopId = null;
        return [...this.currentRecording];
    }
}
