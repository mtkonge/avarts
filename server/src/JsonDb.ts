import type { Database } from "./Database.ts";
import type { Route } from "./Route.ts";
import * as fs from "@std/fs";

export class JsonDb implements Database {
    private constructor() {
    }

    public static async open(): Promise<Database> {
        await fs.ensureFile("jsondb_data/routes.json");
        await Deno.writeTextFile("jsondb_data/.gitignore", "*");
        return new JsonDb();
    }

    getRouteById(id: number): Route {
        throw new Error("Method not implemented.");
    }
    addRoute(route: Route): void {
        throw new Error("Method not implemented.");
    }
    getAllRoutes(): Route[] {
        throw new Error("Method not implemented.");
    }
}
