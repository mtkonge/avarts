import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";
import { GeolocatorFactory } from "./Geolocator.ts";
import * as utils from "./utils.ts";
import { LoadingDialog } from "./loading.ts";
import { CompassFactory } from "./Compass.ts";

async function main() {
    const loading = new LoadingDialog();
    loading.show();
    const server = await utils.authorizedServer();
    const compass = await CompassFactory.fromWebApi();
    const geolocator = await GeolocatorFactory.fromWebApi();
    const map = await GeoMap.create(
        geolocator,
        compass,
        server,
        document.getElementById("map")!,
    );
    loading.hide();
    map.startMarker();
    let routeRecorder: RouteRecorder | null = null;

    const createRouteButton = document.getElementById("create-route")!;
    const finishRouteButton = document.getElementById("finish-route")!;

    createRouteButton.addEventListener("click", () => {
        createRouteButton.hidden = true;
        finishRouteButton.hidden = false;
        if (routeRecorder !== null) throw new Error("contract broken");
        routeRecorder = RouteRecorder.record(geolocator);
    });

    finishRouteButton.addEventListener("click", async () => {
        createRouteButton.hidden = false;
        finishRouteButton.hidden = true;
        if (routeRecorder === null) throw new Error("contract broken");
        const route = routeRecorder.stop();
        routeRecorder = null;
        await map.addRoute({ route });
    });
}

await main().catch((error) => {
    document.body.style =
        "text-align: center; font-size: 3rem; margin-top: 2rem;";
    document.body.textContent = error.toString();
});
