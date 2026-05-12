export interface Compass {
    heading(): number;
    on(type: "update", handler: (heading: number) => void): number;
}

export class CompassFactory {
    public static async fromWebApi(): Promise<Compass> {
        return await WebApiCompass.create();
    }
}

type PermissionNameExt = "accelerometer" | "magnetometer" | "gyroscope";

class WebApiCompass implements Compass {
    private eventListenerIdCounter = 0;
    private events = new Map<number, (heading: number) => void>();
    constructor(private lastKnownHeading: number) {
        addEventListener("deviceorientation", ({ alpha }) => {
            if (alpha !== null) {
                this.lastKnownHeading = alpha;
                this.events.values().forEach((handler) =>
                    handler(this.lastKnownHeading)
                );
            }
        });
    }
    public static async create(): Promise<Compass> {
        const names = [
            "accelerometer",
            "magnetometer",
            "gyroscope",
        ] satisfies PermissionNameExt[] as unknown as PermissionName[];
        const perms = await Promise.all(
            names.map((name) => navigator.permissions.query({ name })),
        );
        return await new Promise((resolve) => {
            const functor = ({ alpha }: DeviceOrientationEvent) => {
                if (alpha === null) {
                    return;
                }
                removeEventListener("deviceorientation", functor);
                resolve(new WebApiCompass(alpha));
            };
            addEventListener("deviceorientation", functor);
        });
    }
    heading(): number {
        return this.lastKnownHeading;
    }

    on(_: "update", handler: (heading: number) => void): number {
        const id = this.eventListenerIdCounter;
        this.eventListenerIdCounter++;
        this.events.set(id, handler);
        return id;
    }
}
