import {
    err,
    ok,
    Result,
    Run,
    RunWithUserIdAndId,
    targetCheckpointIndex,
} from "@avarts/shared";
import { Database } from "../Database.ts";
import { Sessions } from "../Session.ts";

type AddRunError = "bad_login" | "db_error" | "bad_route" | "unfinished_run";

export async function addRun(
    request: { run: Run; token: string },
    database: Database,
    sessions: Sessions,
): Promise<Result<void, AddRunError>> {
    const userId = sessions.userIdFromToken(request.token);
    if (userId === null) {
        return err("bad_login");
    }

    const userResult = await database.getUserById(userId);
    if (!userResult.ok) {
        return err("db_error");
    }
    if (userResult.data === null) {
        return err("bad_login");
    }

    const routeResult = await database.getRouteById(
        request.run.routeId,
    );

    if (!routeResult.ok) {
        return err("db_error");
    }
    if (routeResult.data === null) {
        return err("bad_route");
    }

    if (
        targetCheckpointIndex(
            request.run,
            routeResult.data,
        ) !== routeResult.data.coords.length
    ) {
        return err("unfinished_run");
    }

    const dbResult = await database.addRun(
        request.run,
        userId,
    );

    if (!dbResult.ok) {
        return err("db_error");
    }

    return ok();
}

type RunsOnRouteError = "db_error" | "bad_route";

export async function runsOnRoute(
    request: { routeId: number },
    database: Database,
): Promise<Result<RunWithUserIdAndId[], RunsOnRouteError>> {
    const result = await database.runsOnRoute(
        request.routeId,
    );
    if (!result.ok) {
        return err("db_error");
    }
    if (result.data === null) {
        return err("bad_route");
    }
    return ok(result.data);
}
