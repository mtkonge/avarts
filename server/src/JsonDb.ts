import type { Database, Result as DbResult } from "./Database.ts";
import { err, ok, RouteWithUserId, RouteWithUserIdAndId } from "@avarts/shared";
import * as z from "zod";
import { User, UserWithId } from "../../shared/User.ts";

const Routes = z.array(RouteWithUserIdAndId);
type Routes = z.infer<typeof Routes>;
const Users = z.array(UserWithId);
type Users = z.infer<typeof Users>;

export class JsonDb implements Database {
    private static dataDir: string = "jsondb_data";
    private constructor(
        private routes: Routes,
        private users: Users,
        private idCounter: number,
    ) {
    }

    public static async open(): Promise<Database> {
        await Deno.writeTextFile(`${JsonDb.dataDir}/.gitignore`, "*", {
            create: true,
        });
        const routes = await JsonDb.initRoutes();
        const users = await JsonDb.initUsers();
        const idCounter = await JsonDb.initIdCounter();
        return new JsonDb(routes, users, idCounter);
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
            `${JsonDb.dataDir}/id_counter.txt`,
            this.idCounter.toString(),
            { create: true },
        );
    }

    nextId() {
        return this.idCounter++;
    }

    async getRouteById(id: number) {
        const route = this.routes.find((x) => x.id === id);
        if (!route) {
            return err(`invalid id ${id}`);
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

    async getUserById(id: number): Promise<DbResult<UserWithId>> {
        const user = this.users.find((x) => x.id === id);
        if (!user) {
            return err(`invalid id ${id}`);
        }
        return await Promise.resolve(ok(structuredClone(user)));
    }

    async addUser(user: User): Promise<DbResult<void>> {
        const id = this.nextId();
        this.users.push({ ...user, id });
        await this.save();
        return ok();
    }

    async getUserByUsername(
        username: string,
    ): Promise<DbResult<UserWithId | null>> {
        const user = this.users.find((x) => x.username === username);
        if (!user) {
            return ok(null);
        }
        return await Promise.resolve(ok(structuredClone(user)));
    }
}
