import maplibregl, { LngLatLike } from "maplibre-gl";
import { Geolocator } from "./Geolocator.ts";
import { UnauthorizedServer } from "./Server.ts";
import { Compass } from "./Compass.ts";
import { html } from "common-tags";
import { AddRouteRequest, Coords, RouteWithUserIdAndId } from "@avarts/shared";
import { RunRecorder } from "./RunRecorder.ts";

export function coordsToMapLibreCoords(
    coords: Coords,
): LngLatLike {
    return { lat: coords.latitude, lng: coords.longitude };
}

export function coordsToGeoJsonPosition(
    coords: Coords,
): GeoJSON.Position {
    return [coords.longitude, coords.latitude];
}

function userMarker(): maplibregl.Marker {
    const element = document.createElement("span");
    element.textContent = "⬆️";
    element.classList = "user-marker";

    return new maplibregl.Marker({ element });
}

function routesToGeoJson(
    ...routes: RouteWithUserIdAndId[]
): GeoJSON.FeatureCollection {
    const geojson = {
        type: "FeatureCollection",
        features: routes.map((route) => ({
            type: "Feature",
            properties: {
                "description": html`
                    <div>
                        <p>
                            Nothing to see here
                        </p>
                        <button id="start-run-${route
                            .id}-button">Start run</button>
                    </div>
                `,
                "id": route.id,
            },
            geometry: {
                type: "LineString",
                coordinates: route.coords.map(coordsToGeoJsonPosition),
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
                    "line-width": 8,
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
        this.addClickEventOnRouteLayer();
    }

    addClickEventOnRouteLayer() {
        this.raw.on("click", "routes-layer", (event) => {
            const firstFeature = event.features?.at(0);
            if (firstFeature === undefined) {
                return;
            }
            const coordinates = event.lngLat;
            const description: string = firstFeature.properties.description;
            const routeId: number = firstFeature.properties.id;

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(this.raw);

            const startRunButton = document.getElementById(
                `start-run-${routeId}-button`,
            );
            if (startRunButton === null) {
                throw new Error("contract broken");
            }
            startRunButton.addEventListener("click", () => {
                // TODO: Start run
            });
        });
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
    setSource(
        id: LineSourceId,
        ...routes: RouteWithUserIdAndId[]
    ) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) throw new Error("contract broken");
        source.setData(routesToGeoJson(...routes));
    }
    clearSource(id: LineSourceId) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) throw new Error("contract broken");
        source.setData(routesToGeoJson());
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
        private server: UnauthorizedServer,
        private map: MapHelper,
    ) {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()))
            .addTo(map.raw);
    }

    public static async create(
        geolocator: Geolocator,
        compass: Compass,
        server: UnauthorizedServer,
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
            {
                coords: route.coords.filter((_, i) => i < checkpointReached),
                userId: route.userId,
                id: route.id,
            },
        );
        this.map.setSource(
            LineSource.runNotReached,
            {
                coords: route.coords.filter((_, i) => i >= checkpointReached),
                userId: route.userId,
                id: route.id,
            },
        );
    }

    private async reloadRoutes() {
        const routesResult = await this.server.routes();
        if (!routesResult.ok) {
            console.error(routesResult.error);
            return;
        }
        this.routes = routesResult.data;

        this.map.setSource(
            "routes",
            ...this.routes,
        );
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
