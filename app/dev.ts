import { serveDir } from "@std/http/file-server";
import { bundle } from "./bundle.ts";

function alertListening(addr: Addr) {
    console.log(`Listening on http://${addr.hostname}:${addr.port}/`);
}

type Addr = {
    hostname: string;
    port: number;
};

async function check() {
    const command = new Deno.Command("deno", {
        args: ["check", "src"],
        stdout: "piped",
    });
    const process = command.spawn();
    const output = await process.output();
    await Deno.stdout.write(output.stdout);
}

async function watchAndBundle(addr: Addr, clients: WebSocket[]) {
    let changeOccurred = true;
    let running = false;
    setInterval(async () => {
        if (!changeOccurred || running) {
            return;
        }
        running = true;
        console.clear();
        await bundle().catch((err) => console.error(`bundle: ${err}`));
        await check();
        alertListening(addr);
        clients.forEach((x) => x.send("_"));
        changeOccurred = false;
        running = false;
    }, 250);
    const watcher = Deno.watchFs(["src", "static"]);
    for await (const _ of watcher) {
        changeOccurred = true;
    }
}

function serveDist(addr: Addr, clients: WebSocket[]) {
    Deno.serve({
        port: addr.port,
        hostname: addr.hostname,
        onListen: (_) => alertListening(addr),
    }, (req: Request) => {
        if (req.headers.get("upgrade") === "websocket") {
            const { socket, response } = Deno.upgradeWebSocket(req);
            socket.addEventListener("open", () => {
                clients.push(socket);
            });
            socket.addEventListener("close", () => {
                const idx = clients.indexOf(socket);
                if (idx === -1) {
                    return;
                }
                clients.splice(idx, 1);
            });
            return response;
        }

        const pathname = new URL(req.url).pathname;

        if (pathname === "/devserver_injection.js") {
            const script = `
                const socket = new WebSocket("/"); 
                socket.addEventListener("message", () => window.location.reload())
            `;
            return new Response(script, {
                headers: new Headers({
                    "Content-Type": "text/javascript",
                }),
            });
        }

        return serveDir(req, {
            fsRoot: "dist",
            urlRoot: "",
            quiet: true,
        }).then(async (response) => {
            const contentType = response.headers.get("content-type") ?? "";
            if (!contentType.startsWith("text/html")) {
                return response;
            }
            const body = (await response.text())
                .replace(
                    "<!--devserver_injection-->",
                    '<script defer src="/devserver_injection.js"></script>',
                );
            return new Response(body, {
                headers: new Headers({ "Content-Type": "text/html" }),
            });
        });
    });
}

if (import.meta.main) {
    const clients: WebSocket[] = [];
    const addr = {
        hostname: "0.0.0.0",
        port: 8432,
    };
    await bundle();
    watchAndBundle(addr, clients);
    serveDist(addr, clients);
}
