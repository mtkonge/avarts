export type Coords = {
    latitude: number;
    longitude: number;
};

export type LatLng = [number, number];

export function coordsFromLatLng([latitude, longitude]: LatLng): Coords {
    return { latitude, longitude };
}

export function coordsToLatLngTuple(coords: Coords): LatLng {
    return [coords.latitude, coords.longitude];
}

export interface Geolocator {
    coords(): Coords;
}

export type HTMLGeolocationElement = HTMLElement & {
    isValid: boolean;
    invalidReason: string;
    position: {
        coords: Coords;
    } | null;
};

export class GeolocatorFactory {
    public static async fromElement(
        element: HTMLGeolocationElement,
    ): Promise<Geolocator> {
        return await HTMLElementGeolocator.fromElement(element);
    }

    public static async fromWebApi(): Promise<Geolocator> {
        return await WebApiGeolocator.create();
    }
}

class HTMLElementGeolocator implements Geolocator {
    private constructor(
        private element: HTMLGeolocationElement,
        private lastKnownCoords: Coords,
    ) {
        this.element.addEventListener("location", () => {
            if (element.position) {
                this.lastKnownCoords = element.position.coords;
            }
        });
    }
    public static fromElement(
        element: HTMLGeolocationElement,
    ): Promise<Geolocator> {
        return new Promise((resolve) => {
            const ev = () => {
                if (!element.position) {
                    return;
                }
                element.removeEventListener("location", ev);
                resolve(
                    new HTMLElementGeolocator(
                        element,
                        element.position.coords,
                    ),
                );
            };
            element.addEventListener("location", ev);
        });
    }
    coords(): Coords {
        return this.lastKnownCoords;
    }
}

class WebApiGeolocator implements Geolocator {
    private constructor(
        private lastKnownCoords: Coords,
    ) {
        navigator.geolocation.watchPosition(({ coords }) => {
            this.lastKnownCoords = coords;
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
}
