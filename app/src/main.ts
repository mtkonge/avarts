import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";
import { GeolocatorFactory } from "./Geolocator.ts";
import { server } from "./utils.ts";

async function main() {
    const user = await server.user();
    if (!user.ok || user.ok && user.data === null) {
        location.href = "/login.html";
    }
    const geolocator = await GeolocatorFactory.fromWebApi();
    const map = await GeoMap.fromGeolocatorAndMap(
        geolocator,
        document.getElementById("map")!,
        server,
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

    finishRouteButton.addEventListener("click", async () => {
        createRouteButton.hidden = false;
        finishRouteButton.hidden = true;
        const route = routeRecorder.stop();
        await map.addRoute(route);
    });
}

await main();
