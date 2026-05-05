import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Coords } from "./Coords.ts";
import { type HTMLGeolocationElement } from "./HTMLGeolocationElement.ts";

export class GeoMap {
    private routes: Coords[][] = [[
        [9.412228, 56.466753],
        [9.410354, 56.465671],
        [9.412157, 56.464335],
        [9.415502, 56.465763],
        [9.413432, 56.467100],
        [9.412972, 56.467153],
        [9.412228, 56.466753],
    ]];

    private marker: maplibregl.Marker = new maplibregl.Marker();
    private constructor(
        private geolocation: HTMLGeolocationElement,
        private map: maplibregl.Map,
    ) {
    }

    public static async fromHtmlElement(
        geolocation: HTMLGeolocationElement,
        container: HTMLElement,
    ): Promise<GeoMap> {
        return await new Promise((resolve) => {
            const event = () => {
                if (geolocation.position === null) {
                    console.log("couldn't get geo data");
                    return;
                }
                const map = new maplibregl.Map({
                    container,
                    style: "https://tiles.openfreemap.org/styles/bright",
                    center: [
                        geolocation.position.coords.longitude,
                        geolocation.position.coords.latitude,
                    ],
                    zoom: 16,
                });
                map.on("load", () => {
                    const geoMap = new GeoMap(geolocation, map);
                    geoMap.updateRoutes();
                    resolve(geoMap);
                });
                geolocation.removeEventListener("location", event);
            };
            geolocation.addEventListener("location", event);
        });
    }

    public updateRoutes() {
        const geojson: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: this.routes.map((route) => ({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route,
                },
            })),
        };

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
    }

    public startMarker() {
        setInterval(() => {
            if (!this.geolocation.position) {
                return;
            }
            this.marker.remove();
            this.marker.setLngLat(
                [
                    this.geolocation.position.coords.longitude,
                    this.geolocation.position.coords.latitude,
                ],
            );
            this.marker.addTo(this.map);
        }, 1000);
    }
}
