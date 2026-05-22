import { type Ok, type Result, timeForRun } from "@avarts/shared";
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

function placementElement(
    name: string,
    time: ReturnType<typeof utils.formatMs>,
    placement: number,
) {
    const li = document.createElement("li");
    const placementEl = document.createElement("placement");
    placementEl.textContent = `#${placement}`;

    li.append(placementEl, " ", `${time} - ${name}`);
    return li;
}

async function main() {
    const loading = new LoadingDialog();
    loading.show();
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
                    route: x.route,
                }))
                .toSorted((a, b) => a.time - b.time)
                .map((run, i) => ({
                    ...run,
                    placement: i + 1,
                }))
        );

    const recent = runs
        .flat()
        .filter((x) => x.userId === user.id)
        .toSorted((a, b) => a.startTime - b.startTime)
        .map((run) =>
            placementElement(
                run.routeId.toString(),
                utils.formatMs(run.time),
                run.placement,
            )
        );

    const top = runs
        .flat()
        .filter((x) => x.userId === user.id)
        .toSorted((a, b) => a.placement - b.placement)
        .map((run) =>
            placementElement(
                run.routeId.toString(),
                utils.formatMs(run.time),
                run.placement,
            )
        );

    query("#top-runs").replaceChildren(...top);
    query("#recent-runs").replaceChildren(...recent);

    loading.hide();
}

const errors: string[] = [];
await main().catch((error) => {
    errors.push(error.toString());
    document.body.style =
        "font-size: 1.25rem; margin-top: 2rem; white-space: pre; font-family: monospace;";
    document.body.textContent = errors.join("\n\n");
});
