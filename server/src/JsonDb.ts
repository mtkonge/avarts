import type { Database, Result as DbResult } from "./Database.ts";
import { err, ok, RouteWithId } from "@avarts/shared";
import * as z from "zod";

const Routes = z.array(RouteWithId);

export class JsonDb implements Database {
    private static dataDir: string = "jsondb_data";
    private constructor(private routes: RouteWithId[]) {
    }
    private idCounter = 0;

    public static async open(): Promise<Database> {
        await Deno.writeTextFile(`${JsonDb.dataDir}/.gitignore`, "*", {
            create: true,
        });
        const routes = await Deno.readTextFile(`${JsonDb.dataDir}/routes.json`)
            .catch(() => "[]")
            .then((x) => JSON.parse(x))
            .then((x) => Routes.parse(x));
        return new JsonDb(routes);
    }

    async getRouteById(id: number) {
        const route = this.routes.find((x) => x.id === id);
        if (!route) {
            return err(`invalid id ${id}`);
        }
        return await Promise.resolve(ok(structuredClone(route)));
    }
    async addRoute(route: Omit<RouteWithId, "id">): Promise<DbResult<void>> {
        const id = this.idCounter;
        this.idCounter++;
        this.routes.push({ ...route, id });
        await this.save();
        return ok();
    }
    async getAllRoutes(): Promise<DbResult<RouteWithId[]>> {
        return await Promise.resolve(ok(structuredClone(this.routes)));
    }

    private async save() {
        await Deno.writeTextFile(
            `${JsonDb.dataDir}/routes.json`,
            JSON.stringify(this.routes),
            { create: true },
        );
    }
}
