import { Router } from "@oak/oak/router";
import { Database } from "./Database.ts";
import { Sessions } from "./Session.ts";
import bcrypt from "bcryptjs";
import {
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    UserRequest,
    UserResponse,
} from "@avarts/shared";
import { validateResponse } from "./validateResponse.ts";

export function addUserRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post(
        "/login",
        validateResponse(LoginResponse, async (ctx) => {
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

            const dbResult = await database.getUserByUsername(
                parsed.data.username,
            );
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
                parsed.data.password,
                user.password,
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
            ctx.response.body = {
                success: true,
                token,
            };
        }),
    );

    router.post(
        "/logout",
        validateResponse(LogoutResponse, async (ctx) => {
            const parsedResult = LogoutRequest.safeParse(
                await ctx.request.body.json(),
            );
            if (!parsedResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid logout",
                };
                return;
            }
            const user = sessions.userIdFromToken(parsedResult.data.token);
            if (!user.ok) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid logout",
                };
                return;
            }
            sessions.removeSession(user.data);
            ctx.response.body = {
                success: true,
            };
        }),
    );

    router.post(
        "/register",
        validateResponse(RegisterResponse, async (ctx) => {
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
            const userInDbResult = await database.getUserByUsername(
                parsed.data.username,
            );

            if (
                userInDbResult.ok && userInDbResult.data !== null
            ) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error:
                        `user with username '${parsed.data.username}' already exists`,
                };
                return;
            }
            if (!userInDbResult.ok) {
                ctx.response.status = 500;
                ctx.response.body = {
                    success: false,
                    error: parsed.error,
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
        }),
    );

    router.post(
        "/user",
        validateResponse(UserResponse, async (ctx) => {
            const parsed = UserRequest.safeParse(await ctx.request.body.json());
            if (!parsed.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: parsed.error,
                };
                return;
            }
            const token = parsed.data.token;

            const sessionResult = sessions.userIdFromToken(token);
            if (!sessionResult.ok) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid token",
                };
                return;
            }

            const userResult = await database.getUserById(sessionResult.data);

            if (!userResult.ok) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "invalid user",
                };
                return;
            }

            ctx.response.body = {
                success: true,
                data: userResult.data,
            };
        }),
    );
}
