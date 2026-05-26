import {
    type Ok,
    type Result,
    SportId,
    sportNames,
    timeForRun,
} from "@avarts/shared";
import { LoadingDialog } from "./loading.ts";
import * as utils from "./utils.ts";

async function authenticatedUser(): Promise<number> {
    const server = await utils.authorizedServer();
    const user = await server.user({});
    if (!user.ok) {
        throw new Error("invalid login");
    }
    if (user.data === null) {
        throw new Error("invalid login");
    }
    return user.data.id;
}

async function userId(): Promise<number> {
    const params = new URLSearchParams(location.search);

    const param = params.get("user");
    if (param !== null) {
        const id = parseInt(param);
        if (Number.isNaN(id)) {
            params.delete("user");
            location.search = params.toString();
            return -1;
        }
        return id;
    }

    return await authenticatedUser();
}

function query<T extends HTMLElement>(tag: string): T {
    const x = document.querySelector<T>(tag);
    if (!x) throw new Error(`contract broken: '${x}' is an invalid selector`);
    return x;
}

type Run = {
    route: string;
    time: number;
    sport: SportId;
    placement: number;
};

function runElement(
    run: Run,
) {
    const li = document.createElement("li");
    const placementEl = document.createElement("placement");
    placementEl.textContent = `#${run.placement}`;
    const display = sportNames()[run.sport];

    li.append(
        placementEl,
        " ",
        `${utils.formatMs(run.time)} - ${display.emoji} ${run.route}`,
    );
    return li;
}

async function renderRuns() {
    const server = await utils.unauthorizedServer();
    const id = await userId();
    const userRes = await server.userFromId({ id });
    if (!userRes.ok) {
        return;
    }
    if (!userRes.data) {
        return;
    }
    const user = userRes.data;

    const usernameEl = query("#username");
    usernameEl.textContent = user.username;
    const descriptionEl = query("#description");
    descriptionEl.textContent =
        `${user.username} has yet to add a description.`;

    const routes = await server.routes();
    if (!routes.ok) {
        throw new Error("todo: proper error handling");
    }
    function allOk<T, E>(x: Result<T, E>): Ok<T> {
        if (!x.ok) throw new Error("todo: error handling");
        return x;
    }
    const runResults = await Promise.all(routes.data
        .map(async (x) => ({
            route: x,
            runs: await server.runsOnRoute({ routeId: x.id }),
        })));

    const runs = runResults
        .map((x) => ({ ...x, runs: allOk(x.runs).data }))
        .map((x) =>
            x.runs
                .map((run) => ({
                    ...run,
                    time: timeForRun(run, x.route),
                    route: x.route.name,
                }))
                .toSorted((a, b) => a.time - b.time)
                .map((run, i) => ({
                    ...run,
                    placement: i + 1,
                }))
        )
        .flat()
        .filter((x) => x.userId === user.id);

    if (runs.length === 0) {
        const title = document.createElement("h2");
        title.textContent = `${user.username} has no runs`;
        query("#runs").replaceChildren(title);
        return;
    }

    const recent = runs
        .toSorted((a, b) => a.startTime - b.startTime)
        .map(runElement);

    const top = runs
        .toSorted((a, b) => a.placement - b.placement)
        .map(runElement);

    query("#top-runs").replaceChildren(...top);
    query("#recent-runs").replaceChildren(...recent);
}

async function main() {
    const loading = new LoadingDialog();
    loading.show();
    await renderRuns();
    loading.hide();
}

const errors: string[] = [];
await main().catch((error) => {
    errors.push(error.toString());
    document.body.style =
        "font-size: 1.25rem; margin-top: 2rem; white-space: pre; font-family: monospace;";
    document.body.textContent = errors.join("\n\n");
});
