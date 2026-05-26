import { assertUnreachable, type SportId, sportNames } from "@avarts/shared";

export type LeaderboardRun = {
    title: { tag: "route"; route: string } | {
        tag: "user";
        id: number;
        name: string;
    };
    time: number;
    sport: SportId;
    placement: number;
};

function msToDuration(millisecondsTotal: number) {
    const milliseconds = millisecondsTotal % 1000;
    const seconds = (millisecondsTotal - milliseconds) % 60_000;
    const minutes = (millisecondsTotal - seconds - milliseconds) % 3_600_000;
    const hours = (millisecondsTotal - minutes - seconds - milliseconds) %
        86_400_000;
    const days = millisecondsTotal - hours - minutes - seconds - milliseconds;

    return {
        milliseconds,
        seconds: seconds / 1000,
        minutes: minutes / 60_000,
        hours: hours / 3_600_000,
        days: days / 86_400_000,
    };
}

function formatMs(milliseconds: number): HTMLElement {
    function pad(x: number, count: number = 2) {
        return x.toString().padStart(count, "0");
    }

    const time = document.createElement("time");

    const duration = msToDuration(milliseconds);
    let ret = "";
    if (duration.days > 0) {
        ret += `${duration.days}:`;
    }
    if (duration.hours > 0 || ret.length > 0) {
        ret += `${pad(duration.days)}:`;
    }
    ret += `${pad(duration.minutes)}:${duration.seconds}`;
    const ms = document.createElement("ms");

    ms.textContent = `.${pad(duration.milliseconds, 3)}`;

    time.append(ret, ms);

    return time;
}

export function renderLeaderboardRun(
    run: LeaderboardRun,
) {
    const li = document.createElement("li");
    li.classList.add("leaderboard-item");
    const placementEl = document.createElement("placement");
    placementEl.textContent = `#${run.placement}`;
    const display = sportNames()[run.sport];
    const divider = document.createElement("span");
    divider.classList.add("flex-divider");

    const titleVerb = document.createElement("verb");
    let title;
    if (run.title.tag === "route") {
        titleVerb.textContent = "on";
        title = document.createElement("span");
        title.textContent = run.title.route;
    } else if (run.title.tag === "user") {
        titleVerb.textContent = "by";
        title = document.createElement("a");
        title.textContent = run.title.name;
        title.href = `/profile/?user=${run.title.id}`;
    } else {
        assertUnreachable(run.title);
    }
    title.classList.add("title");

    const withVerb = document.createElement("verb");
    withVerb.textContent = "with";

    const container = document.createElement("div");
    container.append(
        withVerb,
        " ",
        display.emoji,
        " ",
        titleVerb,
        " ",
        title,
    );

    li.append(
        placementEl,
        " ",
        formatMs(run.time),
        divider,
        container,
    );
    return li;
}
