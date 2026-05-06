import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";
import { GeolocatorFactory } from "./Geolocator.ts";

async function main() {
    const geolocator = await GeolocatorFactory.fromWebApi();
    const map = await GeoMap.fromGeolocatorAndMap(
        geolocator,
        document.getElementById("map")!,
    );
    map.startMarker();
    const routeRecorder = new RouteRecorder(geolocator);

    const createRouteButton = document.getElementById("create-route")!;
    const finishRouteButton = document.getElementById("finish-route")!;

    createRouteButton.addEventListener("click", () => {
        createRouteButton.hidden = true;
        finishRouteButton.hidden = false;
        routeRecorder.record();
    });

    finishRouteButton.addEventListener("click", () => {
        createRouteButton.hidden = false;
        finishRouteButton.hidden = true;
        const route = routeRecorder.stop();
        map.addRoute(route);
    });
}

await main();
