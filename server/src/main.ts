import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { oakCors } from "@tajpouria/cors";
import { api } from "./api.ts";
import { JsonDb } from "./JsonDb.ts";

async function main() {
    const app = new Application();
    const router = new Router();
    const database = await JsonDb.open();
    api(router, database);
    app.use(oakCors());
    app.use(router.routes());
    app.use(router.allowedMethods());
    await app.listen({ port: 8000 });
}

await main();
