import maplibregl, { LngLatLike } from "maplibre-gl";
import { Geolocator } from "./Geolocator.ts";
import { Server } from "./Server.ts";
import { Compass } from "./Compass.ts";
import type {
    AddRouteRequest,
    Coords,
    RouteWithUserIdAndId,
} from "@avarts/shared";
import { RunRecorder } from "./RunRecorder.ts";

export function coordsToMapLibreCoords(
    coords: Coords,
): LngLatLike {
    return { lat: coords.latitude, lng: coords.longitude };
}

export function coordsToGeoJsonPosition(
    coords: Coords,
): GeoJSON.Position {
    return [coords.latitude, coords.longitude];
}

function userMarker(): maplibregl.Marker {
    const element = document.createElement("span");
    element.textContent = "⬆️";
    element.classList = "user-marker";

    return new maplibregl.Marker({ element });
}

function routesToGeoJson(
    ...routes: Coords[][]
): GeoJSON.FeatureCollection {
    const geojson = {
        type: "FeatureCollection",
        features: routes.map((coords) => ({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: coords.map(coordsToGeoJsonPosition),
            },
        })),
    } satisfies GeoJSON.FeatureCollection;
    return geojson;
}

const LineSource = {
    routes: "routes",
    runReached: "run-reached",
    runNotReached: "run-not-reached",
} as const;

type LineSourceId = typeof LineSource[keyof typeof LineSource];

class MapHelper {
    constructor(
        public readonly raw: maplibregl.Map,
    ) {
        this.addLayersAndSources();
    }
    private addLayersAndSources() {
        function layer(
            id: typeof LineSource[keyof typeof LineSource],
            color: string,
        ): maplibregl.LayerSpecification {
            return {
                id: `${id}-layer`,
                type: "line",
                source: `${id}`,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": color,
                    "line-width": 4,
                },
            };
        }

        Object.values(LineSource).map((id) =>
            this.raw.addSource(id, {
                type: "geojson",
                data: routesToGeoJson(),
            })
        );

        [
            layer(LineSource.routes, "#4444FF"),
            layer(LineSource.runReached, "#4444FF"),
            layer(LineSource.runNotReached, "#FF4444"),
        ].map((x) => this.raw.addLayer(x));
    }

    lock() {
        this.raw.dragPan.disable();
        this.raw.dragRotate.disable();
        this.raw.touchZoomRotate.disableRotation();
    }
    easeTo(coords: Coords) {
        this.raw.easeTo({
            animate: false,
            center: coordsToMapLibreCoords(coords),
        });
    }
    rotateTo(heading: number) {
        this.raw.rotateTo(heading, {
            animate: false,
        });
    }
    setSource(id: LineSourceId, ...coords: Coords[][]) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) throw new Error("contract broken");
        source.setData(routesToGeoJson(...coords));
    }
    clearSource(id: LineSourceId) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) throw new Error("contract broken");
        source.setData(routesToGeoJson([]));
    }
    unlock() {
        this.raw.dragPan.disable();
        this.raw.dragRotate.disable();
        this.raw.touchZoomRotate.disableRotation();
    }
}

export class GeoMap {
    private routes: RouteWithUserIdAndId[] = [];

    private marker: maplibregl.Marker = userMarker();
    private run: RunRecorder | null = null;
    private constructor(
        private geolocator: Geolocator,
        private compass: Compass,
        private server: Server,
        private map: MapHelper,
    ) {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()))
            .addTo(map.raw);
    }

    public static async create(
        geolocator: Geolocator,
        compass: Compass,
        server: Server,
        mapContainer: HTMLElement,
    ): Promise<GeoMap> {
        const coords = geolocator.coords();
        const map = new maplibregl.Map({
            container: mapContainer,
            style: "https://tiles.openfreemap.org/styles/bright",
            center: coordsToMapLibreCoords(coords),
            zoom: 16,
        });
        return await new Promise((resolve) => {
            map.on("load", () => {
                const geoMap = new GeoMap(
                    geolocator,
                    compass,
                    server,
                    new MapHelper(map),
                );
                geoMap.reloadRoutes();
                // geoMap.startRun();
                resolve(geoMap);
            });
        });
    }

    private reloadRun() {
        if (this.run === null) {
            this.map.clearSource(LineSource.runReached);
            this.map.clearSource(LineSource.runNotReached);
            return;
        }
        const checkpointReached = this.run.checkpointIndex();
        const route = this.routes.find((x) => x.id === this.run!.routeId());
        if (!route) throw new Error("contract broken");

        this.map.setSource(
            LineSource.runReached,
            route.coords.filter((_, i) => i < checkpointReached),
        );
        this.map.setSource(
            LineSource.runNotReached,
            route.coords.filter((_, i) => i >= checkpointReached),
        );
    }

    private async reloadRoutes() {
        const routesResult = await this.server.routes();
        if (!routesResult.ok) {
            console.error(routesResult.error);
            return;
        }
        this.routes = routesResult.data;
        this.map.setSource("routes", ...this.routes.map((x) => x.coords));
    }

    private rotateWithCompass(): number {
        return this.compass.addEvent("update", (heading: number) => {
            this.map.rotateTo(heading);
        });
    }

    private followLocation(): number {
        return this.geolocator.addEvent("update", (coords: Coords) => {
            this.map.easeTo(coords);
        });
    }

    public startRun(route: RouteWithUserIdAndId) {
        if (this.run !== null) throw new Error("contract broken");
        this.map.lock();
        this.run = RunRecorder.record(this.geolocator, route);
        const compassEvent = this.rotateWithCompass();
        const geolocatorEvent = this.followLocation();

        this.reloadRun();
        const interval = setInterval(() => {
            if (this.run === null) throw new Error("contract broken");
            this.reloadRun();
            if (this.run.checkpointIndex() < route.coords.length) {
                return;
            }
            const run = this.run.stop();
            this.server.addRun({ token: "blablablablalba", run });
            clearInterval(interval);
            this.geolocator.removeEvent(geolocatorEvent);
            this.compass.removeEvent(compassEvent);
            this.run = null;
        }, 500);
    }

    public async addRoute(request: AddRouteRequest) {
        await this.server.addRoute(request);
        this.reloadRoutes();
    }

    public startMarker() {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()));
        this.geolocator.addEvent("update", (coords: Coords) => {
            this.marker.setLngLat(coordsToMapLibreCoords(coords));
        });
    }
}
