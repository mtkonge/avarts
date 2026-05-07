import type { Database, Result as DbResult } from "./Database.ts";
import { err, ok } from "./Result.ts";
import type { Route } from "./Route.ts";
import * as z from "zod";

const coord = z.tuple([z.number(), z.number()]);

const Route = z.strictObject({
    id: z.number(),
    coords: z.array(coord),
});

const Routes = z.array(Route);

export class JsonDb implements Database {
    private static dataDir: string = "jsondb_data";
    private constructor(private routes: Route[]) {
    }

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
    async addRoute(route: Route): Promise<DbResult<void>> {
        this.routes.push(route);
        await this.save();
        return ok();
    }
    async getAllRoutes(): Promise<DbResult<Route[]>> {
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
