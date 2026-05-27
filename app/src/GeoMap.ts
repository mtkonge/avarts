import maplibregl, { type LngLatLike } from "maplibre-gl";
import type { Geolocator } from "./Geolocator.ts";
import type { AuthorizedServer } from "./Server.ts";
import type { Compass } from "./Compass.ts";
import * as utils from "./utils.ts";
import { html } from "./utils.ts";
import {
    type AddRouteRequest,
    type Coords,
    type Forget,
    type RouteWithUserIdAndId,
    type RunWithUserIdAndId,
    type SportId,
    timeForRun,
} from "@avarts/shared";
import { RunRecorder } from "./RunRecorder.ts";
import { type LeaderboardRun, renderLeaderboardRun } from "./leaderboard.ts";

export function coordsToMapLibreCoords(
    coords: Coords,
): LngLatLike {
    return { lat: coords.latitude, lng: coords.longitude };
}

export function coordsToGeoJsonPosition(
    coords: Coords,
): GeoJSON.Position {
    return [coords.longitude, coords.latitude];
}

function userMarker(): maplibregl.Marker {
    const element = document.createElement("span");
    element.textContent = "⭕";
    element.classList = "user-marker";

    return new maplibregl.Marker({ element });
}

function routesToGeoJson(
    ...routes: RouteWithUserIdAndId[]
): GeoJSON.FeatureCollection {
    const geojson = {
        type: "FeatureCollection",
        features: routes.map((route) => ({
            type: "Feature",
            properties: {
                "description": html`
                    <div>
                        <p>
                            Loading...
                        </p>
                    </div>
                `,
                "id": route.id,
            },
            geometry: {
                type: "LineString",
                coordinates: route.coords.map(coordsToGeoJsonPosition),
            },
        })),
    } satisfies GeoJSON.FeatureCollection;
    return geojson;
}

const LineSource = {
    routes: "routes",
    runReached: "run-reached",
    runNotReached: "run-not-reached",
} as const;

type LineSourceId = typeof LineSource[keyof typeof LineSource];

class MapHelper {
    private runInformation: (routeId: number) => Promise<
        {
            route: RouteWithUserIdAndId;
            runs: RunWithUserIdAndId[];
            users: { username: string; id: number }[];
        } | null
    > = () => {
        return Promise.resolve(null);
    };
    private startRun: (routeId: number) => Promise<void | null> = () => {
        return Promise.resolve(null);
    };
    constructor(
        public readonly raw: maplibregl.Map,
    ) {
        this.addLayersAndSources();
        this.raw.setMaxPitch(0);
        this.raw.setMinPitch(0);
    }
    private addLayersAndSources() {
        function layer(
            id: typeof LineSource[keyof typeof LineSource],
            color: string,
        ): maplibregl.LayerSpecification {
            return {
                id: `${id}-layer`,
                type: "line",
                source: `${id}`,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": color,
                    "line-width": 8,
                },
            };
        }

        Object.values(LineSource).map((id) =>
            this.raw.addSource(id, {
                type: "geojson",
                data: routesToGeoJson(),
            })
        );

        [
            layer(LineSource.routes, "#4444FF"),
            layer(LineSource.runReached, "#4444FF"),
            layer(LineSource.runNotReached, "#FF4444"),
        ].map((x) => this.raw.addLayer(x));
        this.addClickEventOnRouteLayer();
    }

    addLateFunctions(
        x: {
            startRun: (routeId: number) => Promise<void>;
            runInformation: (
                routeId: number,
            ) => Promise<
                {
                    route: RouteWithUserIdAndId;
                    runs: RunWithUserIdAndId[];
                    users: { username: string; id: number }[];
                }
            >;
        },
    ) {
        this.startRun = x.startRun;
        this.runInformation = x.runInformation;
    }

    addClickEventOnRouteLayer() {
        this.raw.on("click", "routes-layer", async (event) => {
            const firstFeature = event.features?.at(0);
            if (firstFeature === undefined) {
                return;
            }
            const coordinates = event.lngLat;
            const routeId: number = firstFeature.properties.id;
            const maybeRunInformation = await this.runInformation(routeId);
            if (maybeRunInformation === null) {
                throw new Error("run information function not defined");
            }
            const { runs, route, users } = maybeRunInformation;
            const description = html`
                <div>
                    <h1>
                        ${route.name}
                    </h1>
                    <p>
                        Runs recorded: ${runs.length}
                    </p>
                    <button class="popup-button" id="start-run-${route
                        .id}-button">
                        Start run
                    </button>
                    <button class="popup-button" id="leaderboard-${route
                        .id}-button">
                        Leaderboard
                    </button>
                </div>
            `;

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(this.raw);

            const startRunButton = utils.query(
                `#start-run-${routeId}-button`,
            );
            if (startRunButton === null) {
                throw new Error("start-run-button id changed");
            }
            startRunButton.addEventListener("click", async () => {
                if (await this.startRun(routeId) === null) {
                    throw new Error("start run function not defined");
                }
            });
            const leaderboardButton = utils.query(
                `#leaderboard-${routeId}-button`,
            );
            const leaderboardDialog = utils.query<HTMLDialogElement>(
                "#leaderboard-dialog",
            );
            const leaderboardTitleElement = utils.query(
                "#leaderboard-title",
            );

            const leaderboardContentElement = utils.query(
                "#leaderboard-content",
            );

            leaderboardButton.addEventListener("click", () => {
                leaderboardDialog.showModal();
                leaderboardTitleElement.innerText = `${route.name} Leaderboard`;
                if (runs.length === 0) {
                    leaderboardContentElement.textContent =
                        "No one has run the route yet";
                    return;
                }

                const runsWithTimes = runs
                    .map((run) => {
                        const user = users.find((x) => x.id === run.userId);
                        if (user === undefined) throw new Error("unreachable");
                        return {
                            time: timeForRun(run, route),
                            title: {
                                tag: "user",
                                id: user.id,
                                name: user.username,
                            },
                            sport: run.sport,
                            placement: -1,
                        } satisfies LeaderboardRun;
                    })
                    .sort((a, b) => a.time - b.time)
                    .map((run, index) => ({ ...run, placement: index + 1 }))
                    .map(renderLeaderboardRun);

                leaderboardContentElement.replaceChildren(...runsWithTimes);
            });
        });
    }

    moveTo(coords: Coords) {
        this.raw.jumpTo({
            center: coordsToMapLibreCoords(coords),
        });
    }
    rotateTo(bearing: number) {
        this.raw.jumpTo({
            bearing,
        });
    }
    zoomTo(zoom: number) {
        this.raw.jumpTo({
            zoom,
        });
    }
    setCenteredZoom(center: boolean) {
        this.raw.scrollZoom.disable();
        this.raw.touchZoomRotate.disable();

        if (center) {
            const around = { around: "center" } as const;
            this.raw.scrollZoom.enable(around);
            this.raw.touchZoomRotate.enable(around);
        } else {
            this.raw.scrollZoom.enable();
            this.raw.touchZoomRotate.enable();
        }
    }

    setSource(
        id: LineSourceId,
        ...routes: RouteWithUserIdAndId[]
    ) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) {
            throw new Error(`source with id '${id}' doesn't exist`);
        }
        source.setData(routesToGeoJson(...routes));
    }
    clearSource(id: LineSourceId) {
        const source = this.raw.getSource<maplibregl.GeoJSONSource>(id);
        if (source === undefined) {
            throw new Error(`source with id '${id}' doesn't exist`);
        }
        source.setData(routesToGeoJson());
    }
}

export class GeoMap {
    private routes: RouteWithUserIdAndId[] = [];

    private marker: maplibregl.Marker = userMarker();
    private run: RunRecorder | null = null;
    private followingUser = false;
    private constructor(
        private geolocator: Geolocator,
        private compass: Compass,
        private server: AuthorizedServer,
        private map: MapHelper,
        private followUserButton: HTMLElement,
        private selectedSport: () => SportId,
    ) {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()))
            .addTo(map.raw);
        this.map.addLateFunctions({
            startRun: async (routeId: number) => {
                const route = await server.route({ id: routeId });
                if (!route.ok) {
                    console.error(route.error);
                    return;
                }
                this.startRun(route.data);
            },
            runInformation: async (
                routeId: number,
            ): Promise<{
                route: RouteWithUserIdAndId;
                runs: RunWithUserIdAndId[];
                users: { username: string; id: number }[];
            }> => {
                const route = await server.route({ id: routeId });
                const runs = await server.runsOnRoute({ routeId });
                if (!runs.ok) {
                    console.error(runs.error);
                    throw new Error("todo: error handling");
                }
                if (!route.ok) {
                    console.error(route.error);
                    throw new Error("todo: error handling");
                }
                const distinctUserIds = [
                    ...new Set(runs.data.map((run) => run.userId)),
                ];
                const distinctUsers = (await Promise.all(
                    distinctUserIds.map(async (id) => {
                        const user = await server.userFromId({ id });
                        if (!user.ok) {
                            console.error(user.error);
                            return null;
                        }
                        return user.data;
                    }),
                )).filter((user) => user !== null);
                return {
                    runs: runs.data,
                    route: route.data,
                    users: distinctUsers,
                };
            },
        });

        this.map.raw.on("dragstart", (ev) => {
            if (!this.followingUser) return;
            const type = ev.originalEvent?.type ?? "none";
            const isUser = type.startsWith("mouse") || type.startsWith("touch");
            if (isUser) {
                this.unfollowUser();
            }
        });

        this.map.raw.on("rotatestart", (ev) => {
            if (!this.followingUser) return;
            const type = ev.originalEvent?.type ?? "none";
            const isUser = type.startsWith("mouse") || type.startsWith("touch");
            if (isUser) {
                this.unfollowUser();
            }
        });

        this.followUserButton.addEventListener("click", () => {
            this.followUser();
        });

        this.compass.addEvent("update", (heading: number) => {
            if (!this.followingUser) return;
            this.map.rotateTo(heading);
        });

        this.geolocator.addEvent("update", (coords: Coords) => {
            if (!this.followingUser) return;
            this.map.moveTo(coords);
        });
    }

    public static async create(
        geolocator: Geolocator,
        compass: Compass,
        server: AuthorizedServer,
        mapContainer: HTMLElement,
        followButton: HTMLElement,
        selectedSport: () => SportId,
    ): Promise<GeoMap> {
        const coords = geolocator.coords();
        const map = new maplibregl.Map({
            container: mapContainer,
            style: "https://tiles.openfreemap.org/styles/bright",
            center: coordsToMapLibreCoords(coords),
            zoom: 16,
            attributionControl: false,
        });
        return await new Promise((resolve) => {
            map.once("load", () => {
                const mapHelper = new MapHelper(map);
                const geoMap = new GeoMap(
                    geolocator,
                    compass,
                    server,
                    mapHelper,
                    followButton,
                    selectedSport,
                );
                geoMap.reloadRoutes();
                resolve(geoMap);
            });
        });
    }

    private reloadRun() {
        const run = this.run;
        if (run === null) {
            this.map.clearSource(LineSource.runReached);
            this.map.clearSource(LineSource.runNotReached);
            return;
        }
        const checkpointReached = run.checkpointIndex();
        const route = this.routes.find((x) => x.id === run.routeId());
        if (!route) {
            throw new Error(
                `route with id '${run.routeId()}' doesn't exist when reloading run`,
            );
        }

        this.map.setSource(
            LineSource.runReached,
            {
                coords: route.coords.filter((_, i) => i < checkpointReached),
                name: route.name,
                userId: route.userId,
                id: route.id,
            },
        );
        this.map.setSource(
            LineSource.runNotReached,
            {
                coords: route.coords.filter((_, i) => i >= checkpointReached),
                name: route.name,
                userId: route.userId,
                id: route.id,
            },
        );
    }

    private async reloadRoutes() {
        const routesResult = await this.server.routes();
        if (!routesResult.ok) {
            console.error(routesResult.error);
            return;
        }
        this.routes = routesResult.data;

        this.map.setSource(
            "routes",
            ...this.routes,
        );
    }

    private followUser() {
        this.followingUser = true;
        this.followUserButton.hidden = true;
        this.map.zoomTo(16);
        this.map.moveTo(this.geolocator.coords());
        this.map.rotateTo(this.compass.heading());
        this.map.setCenteredZoom(true);
    }
    private unfollowUser() {
        this.followingUser = false;
        this.followUserButton.hidden = false;
        this.map.raw.scrollZoom.disable();
        this.map.raw.scrollZoom.enable();
        this.map.setCenteredZoom(false);
    }

    public startRun(route: RouteWithUserIdAndId) {
        if (this.run !== null) throw new Error("run already exists");
        this.followUser();
        this.run = RunRecorder.record(
            this.selectedSport(),
            this.geolocator,
            route,
        );

        this.reloadRun();
        const interval = setInterval(() => {
            if (this.run === null) throw new Error("run doesn't exist");
            this.reloadRun();
            if (this.run.checkpointIndex() < route.coords.length) {
                return;
            }
            const run = this.run.stop();
            this.server.addRun({ run });
            clearInterval(interval);
            this.run = null;
            this.unfollowUser();
        }, 500);
    }

    public async addRoute(request: Forget<AddRouteRequest, "token">) {
        await this.server.addRoute(request);
        this.reloadRoutes();
    }

    public startMarker() {
        this.marker.setLngLat(coordsToMapLibreCoords(this.geolocator.coords()));
        this.geolocator.addEvent("update", (coords: Coords) => {
            this.marker.setLngLat(coordsToMapLibreCoords(coords));
        });
    }
}
