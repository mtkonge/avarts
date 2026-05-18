import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { oakCors } from "@tajpouria/cors";
import { api } from "./api/mod.ts";
import { JsonDb } from "./JsonDb.ts";
import { Sessions } from "./Session.ts";

async function main() {
    const app = new Application();
    const router = new Router();
    const database = await JsonDb.open();
    const sessions = new Sessions();
    api(router, database, sessions);
    app.use(oakCors());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.addEventListener("listen", () => {
        console.log("listening on :8200");
    });
    await app.listen({ port: 8200 });
}

await main();
