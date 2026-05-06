import type { HTMLGeolocationElement } from "./HTMLGeolocationElement.ts";
import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";

const geo = document.getElementById("geo")! as HTMLGeolocationElement;

async function loadMap(): Promise<GeoMap> {
    return await GeoMap.fromHtmlElement(
        geo,
        document.getElementById("map")!,
    );
}

async function main() {
    const map = await loadMap();
    map.startMarker();
    const routeRecorder = new RouteRecorder(geo);

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
