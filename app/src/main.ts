import { GeoMap } from "./GeoMap.ts";
import { GeolocatorFactory } from "./Geolocator.ts";
import * as utils from "./utils.ts";
import { LoadingDialog } from "./loading.ts";
import { CompassFactory } from "./Compass.ts";
import { SportSelector } from "./sports.ts";

async function main() {
    const loading = new LoadingDialog();
    loading.show();
    const sportSelector = new SportSelector(
        utils.query("#select-sport")!,
    );
    const server = await utils.authorizedServer();
    const compass = await CompassFactory.fromWebApi();
    const geolocator = await GeolocatorFactory.fromWebApi();
    const map = await GeoMap.create(
        geolocator,
        compass,
        server,
        utils.query("#map"),
        utils.query("#follow-user"),
        utils.query("#create-route"),
        () => sportSelector.selectedSport,
    );
    loading.hide();
    map.startMarker();

    const logOutButton = utils.query("#log-out");

    logOutButton.addEventListener("click", async () => {
        loading.show();
        await server.logout({});
        location.href = "/";
    });

    const leaderboardDialog = utils.query<HTMLDialogElement>(
        "#leaderboard-dialog",
    );

    const leaderboardCloseButton = utils.query(
        "#leaderboard-close-button",
    );

    leaderboardCloseButton.addEventListener("click", () => {
        leaderboardDialog.close();
    });

    leaderboardDialog.addEventListener("mousedown", (event) => {
        if (event.target === event.currentTarget) {
            leaderboardDialog.close();
        }
    });
}

const errors: string[] = [];
await main().catch((error) => {
    console.error(error);
    errors.push(error.toString());
    document.body.style =
        "font-size: 1.25rem; margin-top: 2rem; white-space: pre; font-family: monospace;";
    document.body.textContent = errors.join("\n\n");
});
