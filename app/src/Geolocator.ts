export type Coords = {
    latitude: number;
    longitude: number;
    heading?: number;
};

export interface Geolocator {
    coords(): Coords;
    on(type: "update", handler: (coords: Coords) => void): number;
}

export class GeolocatorFactory {
    public static async fromWebApi(): Promise<Geolocator> {
        return await WebApiGeolocator.create();
    }
}

class WebApiGeolocator implements Geolocator {
    private eventListenerIdCounter = 0;
    private events = new Map<number, (coords: Coords) => void>();
    private constructor(
        private lastKnownCoords: Coords,
    ) {
        navigator.geolocation.watchPosition(({ coords }) => {
            this.lastKnownCoords = {
                longitude: coords.longitude,
                latitude: coords.latitude,
                heading: coords.heading ?? this.lastKnownCoords.heading,
            };
            this.events.values().forEach((handler) =>
                handler(this.lastKnownCoords)
            );
        });
    }
    public static create(): Promise<Geolocator> {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                resolve(
                    new WebApiGeolocator({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        heading: coords.heading ?? undefined,
                    }),
                );
            });
        });
    }
    coords(): Coords {
        return this.lastKnownCoords;
    }

    on(_: "update", handler: (coords: Coords) => void): number {
        const id = this.eventListenerIdCounter;
        this.eventListenerIdCounter++;
        this.events.set(id, handler);
        return id;
    }
}
