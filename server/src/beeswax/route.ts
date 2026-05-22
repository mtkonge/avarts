import { err, ok, type Result, type Route, type RouteWithUserIdAndId } from "@avarts/shared";
import type { Database } from "../Database.ts";
import type { Sessions } from "../Session.ts";

type AllRoutesError = "db_error";

export async function allRoutes(
    database: Database,
): Promise<Result<{ routes: RouteWithUserIdAndId[] }, AllRoutesError>> {
    const result = await database.getAllRoutes();
    if (!result.ok) {
        return err("db_error");
    }
    return ok({ routes: result.data });
}

type AddRouteError = "bad_login" | "db_error";

export async function addRoute(
    request: { route: Route; token: string },
    database: Database,
    sessions: Sessions,
): Promise<Result<void, AddRouteError>> {
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
    const dbResult = await database.addRoute({
        userId,
        coords: request.route.coords,
    });
    if (!dbResult.ok) {
        return err("db_error");
    }
    return ok();
}

type RouteWithIdError = "bad_id" | "db_error";

export async function routeWithId(
    request: { id: number },
    database: Database,
): Promise<Result<{ route: RouteWithUserIdAndId }, RouteWithIdError>> {
    const result = await database.getRouteById(request.id);
    if (!result.ok) {
        return err("db_error");
    }
    if (result.data === null) {
        return err("bad_id");
    }
    return ok({ route: result.data });
}
