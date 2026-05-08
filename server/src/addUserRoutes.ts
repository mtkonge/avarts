import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import { Sessions } from "./Session.ts";
import z, { success } from "zod";
import bcrypt from "bcryptjs";

const LoginRequest = z.strictObject({
    username: z.string(),
    password: z.string(),
});

const RegisterRequest = z.strictObject({
    username: z.string(),
    password: z.string(),
});

export function addUserRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post("/login", async (ctx) => {
        const parsed = LoginRequest.safeParse(
            await ctx.request.body.json(),
        );
        if (!parsed.success) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: parsed.error,
            };
            return;
        }

        const dbResult = await database.getUserByUsername(parsed.data.username);
        if (!dbResult.ok) {
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "db error",
            };
            return;
        }
        const user = dbResult.data;
        if (!user) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: "invalid login",
            };
            return;
        }
        const bcryptResult = await bcrypt.compare(
            user.password,
            parsed.data.password,
        );
        if (!bcryptResult) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: "invalid login",
            };
            return;
        }
        const token = sessions.addSession(user.id);
        await ctx.cookies.set("token", token, {
            maxAge: 60 * 60 * 24 * 30,
        });
        ctx.response.body = {
            success: true,
        };
    });

    router.post("/logout", async (ctx) => {
        const token = await ctx.cookies.get("token");
        if (!token) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: "invalid logout",
            };
            return;
        }
        const user = sessions.userIdFromToken(token);
        if (!user.ok) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: "invalid logout",
            };
            return;
        }
        sessions.removeSession(user.data);
        ctx.cookies.delete("token");
        ctx.response.body = {
            success: true,
        };
    });

    router.post("/register", async (ctx) => {
        const parsed = RegisterRequest.safeParse(
            await ctx.request.body.json(),
        );

        if (!parsed.success) {
            ctx.response.status = 400;
            ctx.response.body = {
                success: false,
                error: parsed.error,
            };
            return;
        }

        if (await database.getUserByUsername(parsed.data.username)) {
            ctx.response.status = 401;
            ctx.response.body = {
                success: false,
                error:
                    `user with username '${parsed.data.username}' already exists`,
            };
            return;
        }
        const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
        const result = await database.addUser({
            username: parsed.data.username,
            password: hashedPassword,
        });

        if (!result.ok) {
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: parsed.error,
            };
            return;
        }

        ctx.response.body = {
            success: true,
        };
    });
}
