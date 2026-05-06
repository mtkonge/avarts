import type { Database } from "./Database.ts";
import type { Route } from "./Route.ts";
import * as z from "zod";

const coord = z.tuple([z.number(), z.number()]);

const Route = z.strictObject({
    id: z.number(),
    coords: z.array(coord),
});

const Routes = z.array(Route);

export class JsonDb implements Database {
    private static data_dir: string = "jsondb_data";
    private constructor(private routes: Route[]) {
    }

    public static async open(): Promise<Database> {
        await Deno.writeTextFile(`${JsonDb.data_dir}/.gitignore`, "*", {
            create: true,
        });
        const routes = await Deno.readTextFile(`${JsonDb.data_dir}/routes.json`)
            .catch(() => "[]")
            .then((x) => JSON.parse(x))
            .then((x) => Routes.parse(x));
        return new JsonDb(routes);
    }

    getRouteById(id: number): Route {
        const route = this.routes.find((x) => x.id === id);
        if (!route) {
            throw new Error(`invalid id ${id}`);
        }
        return structuredClone(route);
    }
    addRoute(route: Route): void {
        this.routes.push(route);
    }
    getAllRoutes(): Route[] {
        return structuredClone(this.routes);
    }

    async save() {
        await Deno.writeTextFile(
            `${JsonDb.data_dir}/routes.json`,
            JSON.stringify(this.routes),
            { create: true },
        );
    }
}
