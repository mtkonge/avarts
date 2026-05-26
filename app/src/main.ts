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
    const logOutButton = document.getElementById("log-out")!;

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
        const coords = routeRecorder.stop();
        routeRecorder = null;
        const name = prompt("What is the name of this route?");
        if (name === null || name.length === 0) {
            console.error("Name not provided for route");
            return;
        }
        await map.addRoute({ route: { coords, name } });
    });

    logOutButton.addEventListener("click", async () => {
        loading.show();
        await server.logout({});
        location.href = "/";
        loading.hide();
    });
    const sportDialog = document.querySelector<HTMLDialogElement>(
        "sport-dialog",
    )!;
    const sportButton = document.getElementById("select-sport")!;

    sportButton.addEventListener("click", () => {
        sportDialog.showModal();
    });
}

const errors: string[] = [];
await main().catch((error) => {
    errors.push(error.toString());
    document.body.style =
        "font-size: 1.25rem; margin-top: 2rem; white-space: pre; font-family: monospace;";
    document.body.textContent = errors.join("\n\n");
});
