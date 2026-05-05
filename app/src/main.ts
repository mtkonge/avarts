import maplibregl, { MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeoMap, type HTMLGeolocationElement } from "./GeoMap.ts";
import type { Coords } from "./Coords.ts";

const geo = document.getElementById("geo")! as HTMLGeolocationElement;

async function loadMap(): Promise<GeoMap> {
    return await GeoMap.fromHtmlElement(
        geo,
        document.getElementById("map")!,
    );
}

async function main() {
    const map = await loadMap();
    map.start();

    const addRoute = document.getElementById("create-route")!;
    let createRouteLoopId: number | null = null;
    const currentRoute: Coords[] = [];

    addRoute.addEventListener("click", () => {
        if (createRouteLoopId === null) {
            if (geo.position === null) {
                console.log("couldn't get geo data");
                return;
            }
            addRoute.textContent = "Finish route";
            createRouteLoopId = setInterval(() => {
                if (geo.position === null) {
                    console.log("couldn't get geo data");
                    return;
                }
                currentRoute.push([
                    geo.position.coords.longitude,
                    geo.position.coords.latitude,
                ]);
                console.log(currentRoute);
            }, 1000);
        } else {
            addRoute.textContent = "hewwo";
            clearInterval(createRouteLoopId);
            console.log(currentRoute);
            map.addRoute([...currentRoute]);
            map.updateRoutes();
            createRouteLoopId = null;
        }
    });
}

await main();
