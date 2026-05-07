import maplibregl, { LngLatLike } from "maplibre-gl";
import { Coords, Geolocator } from "./Geolocator.ts";

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

export class GeoMap {
    private routes: Coords[][] = [[
        { latitude: 9.412228, longitude: 56.466753 },
        { latitude: 9.410354, longitude: 56.465671 },
        { latitude: 9.412157, longitude: 56.464335 },
        { latitude: 9.415502, longitude: 56.465763 },
        { latitude: 9.413432, longitude: 56.467100 },
        { latitude: 9.412972, longitude: 56.467153 },
        { latitude: 9.412228, longitude: 56.466753 },
    ]];

    private marker: maplibregl.Marker = new maplibregl.Marker();
    private constructor(
        private geolocator: Geolocator,
        private map: maplibregl.Map,
    ) {
    }

    public static async fromGeolocatorAndMap(
        geolocator: Geolocator,
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
        return await new Promise((resolve) => {
            map.on("load", () => {
                const geoMap = new GeoMap(geolocator, map);
                geoMap.updateRoutes();
                resolve(geoMap);
            });
        });
    }

    private updateRoutes() {
        const geojson = {
            type: "FeatureCollection",
            features: this.routes.map((route) => ({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route.map(coordsToGeoJsonPosition),
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

    public addRoute(route: Coords[]) {
        this.routes.push(route);
        this.updateRoutes();
    }

    public startMarker() {
        const coords = this.geolocator.coords();
        setInterval(() => {
            this.marker.remove();
            this.marker.setLngLat(coordsToMapLibreCoords(coords));
            this.marker.addTo(this.map);
            this.map.easeTo({ center: coordsToMapLibreCoords(coords) });
        }, 1000);
    }
}
