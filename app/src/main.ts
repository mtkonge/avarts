import { GeoMap } from "./GeoMap.ts";
import { RouteRecorder } from "./RouteRecorder.ts";
import { GeolocatorFactory } from "./Geolocator.ts";
import { server } from "./utils.ts";
import { AddRouteRequest } from "@avarts/shared";
import { LoadingDialog } from "./loading.ts";

async function main() {
    const loading = new LoadingDialog();
    loading.show();
    const token = localStorage.getItem("token");
    if (token === null) {
        location.href = "/login.html";
        return;
    }
    const user = await server.user({ token });
    if (!user.ok || user.ok && user.data === null) {
        location.href = "/login.html";
        return;
    }
    const geolocator = await GeolocatorFactory.fromWebApi();
    const map = await GeoMap.create(
        geolocator,
        document.getElementById("map")!,
        server,
    );
    loading.hide();
    map.startMarker();
    const routeRecorder = new RouteRecorder(geolocator);

    const createRouteButton = document.getElementById("create-route")!;
    const finishRouteButton = document.getElementById("finish-route")!;

    createRouteButton.addEventListener("click", () => {
        if (localStorage.getItem("token") === null) {
            location.href = "/login.html";
            return;
        }
        createRouteButton.hidden = true;
        finishRouteButton.hidden = false;
        routeRecorder.record();
    });

    finishRouteButton.addEventListener("click", async () => {
        createRouteButton.hidden = false;
        finishRouteButton.hidden = true;
        const token = localStorage.getItem("token");
        if (token === null) {
            location.href = "/login.html";
            return;
        }
        const route = routeRecorder.stop();
        const addRouteRequest: AddRouteRequest = { route, token };
        await map.addRoute(addRouteRequest);
    });
}

await main();
