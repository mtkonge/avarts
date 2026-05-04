import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Coords = [number, number];

type HTMLGeolocationElement = HTMLElement & {
    isValid: boolean;
    invalidReason: string;
    position: {
        coords: {
            longitude: number;
            latitude: number;
        };
    } | null;
};

function drawRoute(map: maplibregl.Map, route: Coords[]) {
    map.addSource("route", {
        "type": "geojson",
        "data": {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": route,
            },
        },
    });
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": "route",
        "layout": {
            "line-join": "round",
            "line-cap": "round",
        },
        "paint": {
            "line-color": "#4444FF",
            "line-width": 8,
        },
    });
}

function main() {
    const geo = document.getElementById("geo")! as HTMLGeolocationElement;
    const info = document.getElementById("info")!;

    try {
        geo.addEventListener("location", () => {
            if (geo.position === null) {
                return;
            }
            info.textContent =
                `${geo.isValid}, ${geo.invalidReason}, "${geo.position.coords.longitude} ${geo.position.coords.latitude}"`;
            const map = new maplibregl.Map({
                container: "map",
                style: "https://tiles.openfreemap.org/styles/bright",
                center: [
                    9.412228,
                    56.466753,
                ],
                zoom: 16,
            });
            const marker = new maplibregl.Marker()
                .setLngLat([
                    9.412228,
                    56.466753,
                ])
                .addTo(map);
            const route: Coords[] = [
                [9.412228, 56.466753],
                [9.410354, 56.465671],
                [9.412157, 56.464335],
                [9.415502, 56.465763],
                [9.413432, 56.467100],
                [9.412972, 56.467153],
                [9.412228, 56.466753],
            ];
            map.on("load", () => {
                drawRoute(map, route);
            });
        });
    } catch (err: unknown) {
        info.textContent = String(err);
    }
}

main();
