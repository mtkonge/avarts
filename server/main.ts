import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { api } from "./api.ts";

async function main() {
    const app = new Application();
    const router = new Router();
    api(router);
    app.use(router.routes());
    app.use(router.allowedMethods());
    await app.listen({ port: 8000 });
}

await main();
