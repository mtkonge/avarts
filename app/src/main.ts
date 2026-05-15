import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";
import { GeolocatorFactory } from "./Geolocator.ts";
import * as utils from "./utils.ts";
import { AddRouteRequest } from "@avarts/shared";
import { LoadingDialog } from "./loading.ts";
import { CompassFactory } from "./Compass.ts";

async function main() {
    const loading = new LoadingDialog();
    loading.show();
    const token = localStorage.getItem("token");
    if (token === null) {
        location.href = "/login.html";
        return;
    }
    const server = utils.unauthorizedServer();
    const user = await server.user({ token });
    if (!user.ok || user.ok && user.data === null) {
        location.href = "/login.html";
        return;
    }
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
    const startRunButton = document.getElementById("start-run")!;

    createRouteButton.addEventListener("click", () => {
        if (localStorage.getItem("token") === null) {
            location.href = "/login.html";
            return;
        }
        createRouteButton.hidden = true;
        finishRouteButton.hidden = false;
        if (routeRecorder !== null) throw new Error("contract broken");
        routeRecorder = RouteRecorder.record(geolocator);
    });

    finishRouteButton.addEventListener("click", async () => {
        createRouteButton.hidden = false;
        finishRouteButton.hidden = true;
        const token = localStorage.getItem("token");
        if (token === null) {
            location.href = "/login.html";
            return;
        }
        if (routeRecorder === null) throw new Error("contract broken");
        const route = routeRecorder.stop();
        routeRecorder = null;
        const addRouteRequest: AddRouteRequest = { route, token };
        await map.addRoute(addRouteRequest);
    });

    startRunButton.addEventListener("click", () => {
        document.body.style =
            "text-align: center; font-size: 3rem; margin-top: 2rem;";
        document.body.innerHTML =
            '<span>not implemented <img src="https://upload.wikimedia.org/wikipedia/en/7/73/Trollface.png" width="60"></span>';
    });
}

await main().catch((error) => {
    document.body.style =
        "text-align: center; font-size: 3rem; margin-top: 2rem;";
    document.body.textContent = error.toString();
});
