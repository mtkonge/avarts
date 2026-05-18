import type { Database, Result as DbResult } from "./Database.ts";
import {
    err,
    ok,
    RouteWithUserId,
    RouteWithUserIdAndId,
    Run,
    RunWithUserIdAndId,
    UserWithPassword,
    UserWithPasswordAndId,
} from "@avarts/shared";
import * as z from "zod";
import * as fs from "@std/fs";

const Routes = z.array(RouteWithUserIdAndId);
type Routes = z.infer<typeof Routes>;
const Users = z.array(UserWithPasswordAndId);
type Users = z.infer<typeof Users>;
const Runs = z.array(RunWithUserIdAndId);
type Runs = z.infer<typeof Runs>;

export class JsonDb implements Database {
    private static dataDir: string = "jsondb_data";
    private constructor(
        private routes: Routes,
        private users: Users,
        private runs: Runs,
        private idCounter: number,
    ) {
    }

    public static async open(): Promise<Database> {
        await fs.ensureDir(JsonDb.dataDir);
        await Deno.writeTextFile(`${JsonDb.dataDir}/.gitignore`, "*", {
            create: true,
        });
        const routes = await JsonDb.initRoutes();
        const users = await JsonDb.initUsers();
        const runs = await JsonDb.initRuns();
        const idCounter = await JsonDb.initIdCounter();
        return new JsonDb(routes, users, runs, idCounter);
    }

    private static async initRoutes(): Promise<Routes> {
        return await Deno.readTextFile(`${JsonDb.dataDir}/routes.json`)
            .catch(() => "[]")
            .then((x) => JSON.parse(x))
            .then((x) => Routes.parse(x));
    }

    private static async initUsers(): Promise<Users> {
        return await Deno.readTextFile(`${JsonDb.dataDir}/users.json`)
            .catch(() => "[]")
            .then((x) => JSON.parse(x))
            .then((x) => Users.parse(x));
    }

    private static async initRuns() {
        return await Deno.readTextFile(`${JsonDb.dataDir}/runs.json`)
            .catch(() => "[]")
            .then((x) => JSON.parse(x))
            .then((x) => Runs.parse(x));
    }

    private static async initIdCounter(): Promise<number> {
        return await Deno.readTextFile(`${JsonDb.dataDir}/id_counter.txt`)
            .catch(() => "0")
            .then((x) => z.number().parse(parseInt(x.trim())));
    }

    private async save() {
        await Deno.writeTextFile(
            `${JsonDb.dataDir}/routes.json`,
            JSON.stringify(this.routes),
            { create: true },
        );
        await Deno.writeTextFile(
            `${JsonDb.dataDir}/users.json`,
            JSON.stringify(this.users),
            { create: true },
        );
        await Deno.writeTextFile(
            `${JsonDb.dataDir}/runs.json`,
            JSON.stringify(this.runs),
            { create: true },
        );
        await Deno.writeTextFile(
            `${JsonDb.dataDir}/id_counter.txt`,
            this.idCounter.toString(),
            { create: true },
        );
    }

    nextId() {
        return this.idCounter++;
    }

    async getRouteById(
        id: number,
    ): Promise<DbResult<RouteWithUserIdAndId | null>> {
        const route = this.routes.find((x) => x.id === id);
        if (!route) {
            return ok(null);
        }
        return await Promise.resolve(ok(structuredClone(route)));
    }
    async addRoute(route: RouteWithUserId): Promise<DbResult<void>> {
        const id = this.nextId();
        this.routes.push({ ...route, id });
        await this.save();
        return ok();
    }
    async getAllRoutes(): Promise<DbResult<Routes>> {
        return await Promise.resolve(ok(structuredClone(this.routes)));
    }

    async getUserById(id: number): Promise<DbResult<UserWithPasswordAndId>> {
        const user = this.users.find((x) => x.id === id);
        if (!user) {
            return err(`invalid id ${id}`);
        }
        return await Promise.resolve(ok(structuredClone(user)));
    }

    async addUser(user: UserWithPassword): Promise<DbResult<void>> {
        const id = this.nextId();
        this.users.push({ ...user, id });
        await this.save();
        return ok();
    }

    async getUserByUsername(
        username: string,
    ): Promise<DbResult<UserWithPasswordAndId | null>> {
        const user = this.users.find((x) => x.username === username);
        if (!user) {
            return ok(null);
        }
        return await Promise.resolve(ok(structuredClone(user)));
    }

    async addRun(run: Run, userId: number): Promise<DbResult<void>> {
        const id = this.nextId();
        const user = await this.getUserById(userId);
        const route = await this.getRouteById(run.routeId);
        if (!user.ok) {
            return err("user doesn't exist");
        }
        if (!route.ok) {
            return err("route doesn't exist");
        }
        this.runs.push({ ...run, userId, id });
        this.save();
        return ok();
    }
}
