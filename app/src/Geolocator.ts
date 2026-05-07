export type Coords = {
    latitude: number;
    longitude: number;
};

export interface Geolocator {
    coords(): Coords;
    on(type: "update", handler: (coords: Coords) => void): number;
}

export type HTMLGeolocationElement = HTMLElement & {
    isValid: boolean;
    invalidReason: string;
    position: {
        coords: Coords;
    } | null;
};

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
            this.lastKnownCoords = coords;
            this.events.values().forEach((handler) => handler(coords));
        });
    }
    public static create(): Promise<Geolocator> {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                resolve(
                    new WebApiGeolocator({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
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
