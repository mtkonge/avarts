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
        addEventListener("deviceorientationabsolute", ({ alpha }) => {
            if (alpha !== null) {
                this.lastKnownHeading = WebApiCompass.alphaToCardinalDegrees(
                    alpha,
                );
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
        try {
            await Promise.all(
                names.map((name) => navigator.permissions.query({ name })),
            );
        } catch {
            return new WebApiCompass(0);
        }
        return await new Promise((resolve) => {
            const functor = ({ alpha }: DeviceOrientationEvent) => {
                if (alpha === null) {
                    return;
                }
                removeEventListener("deviceorientationabsolute", functor);
                resolve(
                    new WebApiCompass(
                        WebApiCompass.alphaToCardinalDegrees(alpha),
                    ),
                );
            };
            addEventListener("deviceorientationabsolute", functor);
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
    // web api returns N=0, W=90, S=180, E=270, cardinal degrees is E=90, W=270
    private static alphaToCardinalDegrees(heading: number) {
        return Math.abs(heading - 360);
    }
}
