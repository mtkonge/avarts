import maplibregl from "maplibre-gl";
import {
    Coords,
    coordsFromLatLng,
    coordsToLatLngTuple,
    coordsToLngLatTuple,
    Geolocator,
    LatLng,
} from "./Geolocator.ts";

export class GeoMap {
    private routes: Coords[][] = [([
        [9.412228, 56.466753],
        [9.410354, 56.465671],
        [9.412157, 56.464335],
        [9.415502, 56.465763],
        [9.413432, 56.467100],
        [9.412972, 56.467153],
        [9.412228, 56.466753],
    ] satisfies LatLng[]).map(coordsFromLatLng)];

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
        const center = coordsToLngLatTuple(coords);
        const map = new maplibregl.Map({
            container: mapContainer,
            style: "https://tiles.openfreemap.org/styles/bright",
            center,
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
                    coordinates: route.map(coordsToLatLngTuple),
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
            this.marker.setLngLat(coordsToLngLatTuple(coords));
            this.marker.addTo(this.map);
            this.map.easeTo({ center: coordsToLngLatTuple(coords) });
        }, 1000);
    }
}
