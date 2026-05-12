import maplibregl, { LngLatLike } from "maplibre-gl";
import { Coords, Geolocator } from "./Geolocator.ts";
import { Server } from "./Server.ts";
import { AddRouteRequest, type RouteWithUserIdAndId } from "@avarts/shared";
import { Compass } from "./Compass.ts";

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

export class GeoMap {
    private routes: RouteWithUserIdAndId[] = [];

    private marker: maplibregl.Marker = userMarker();
    private constructor(
        private geolocator: Geolocator,
        private compass: Compass,
        private server: Server,
        private map: maplibregl.Map,
    ) {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()))
            .addTo(map);
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
        map.dragPan.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        return await new Promise((resolve) => {
            map.on("load", () => {
                const geoMap = new GeoMap(geolocator, compass, server, map);
                geoMap.reloadRoutes();
                resolve(geoMap);
            });
        });
    }

    private async reloadRoutes() {
        const routesResult = await this.server.routes();
        if (!routesResult.ok) {
            console.error(routesResult.error);
            return;
        }
        this.routes = routesResult.data;

        const geojson = {
            type: "FeatureCollection",
            features: this.routes.map((route) => ({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route.coords.map(coordsToGeoJsonPosition),
                },
            })),
        } satisfies GeoJSON.FeatureCollection;

        const source = this.map.getSource("routes") as maplibregl.GeoJSONSource;

        if (source) {
            source.setData(geojson);
            return;
        }
        this.map.addSource("routes", {
            type: "geojson",
            data: geojson,
        });

        this.map.addLayer({
            id: "routes-layer",
            type: "line",
            source: "routes",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#4444FF",
                "line-width": 8,
            },
        });
    }

    public async addRoute(route: AddRouteRequest) {
        await this.server.addRoute(route);
        this.reloadRoutes();
    }

    public startMarker() {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()));
        this.geolocator.on("update", (coords: Coords) => {
            this.marker.setLngLat(coordsToMapLibreCoords(coords));
            this.map.easeTo({ center: coordsToMapLibreCoords(coords) });
        });
        this.compass.on("update", (heading: number) => {
            this.map.rotateTo(heading);
            this.marker.setRotation(heading);
        });
    }
}
