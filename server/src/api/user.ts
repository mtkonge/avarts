import { Router } from "@oak/oak/router";
import { Database } from "../Database.ts";
import { Sessions } from "../Session.ts";
import * as beeswax from "../beeswax/mod.ts";
import {
    assertUnreachable,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    UserRequest,
    UserResponse,
} from "@avarts/shared";
import {
    check,
    Pmr as Pmr,
} from "./parserMiddleware.ts";

export function addUserRoutes(
    router: Router,
    database: Database,
    sessions: Sessions,
) {
    router.post(
        "/login",
        check(
            LoginRequest,
            LoginResponse,
            async (req): Pmr<LoginResponse> => {
                const result = await beeswax.login(req, database, sessions);
                if (!result.ok) {
                    switch (result.error) {
                        case "db_error":
                            return {
                                status: 500,
                                body: { success: false, error: "db error" },
                            };
                        case "bad_login":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid login",
                                },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return { body: { success: true, token: result.data.token } };
            },
        ),
    );

    router.post(
        "/logout",
        check(
            LogoutRequest,
            LogoutResponse,
            async (req): Pmr<LogoutResponse> => {
                const result = await beeswax.logout(req, sessions);
                if (!result.ok) {
                    switch (result.error) {
                        case "bad_login":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid login",
                                },
                            };
                        default:
                            assertUnreachable(result.error);
                    }
                }
                return {
                    body: { success: true },
                };
            },
        ),
    );

    router.post(
        "/register",
        check(
            RegisterRequest,
            RegisterResponse,
            async (req): Pmr<RegisterResponse> => {
                const result = await beeswax.register(req, database);
                if (!result.ok) {
                    switch (result.error) {
                        case "username_taken":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error:
                                        `username '${req.username}' is already taken`,
                                },
                            };
                        case "db_error":
                            return {
                                status: 500,
                                body: {
                                    success: false,
                                    error: "db error",
                                },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return { body: { success: true } };
            },
        ),
    );

    router.post(
        "/user",
        check(
            UserRequest,
            UserResponse,
            async (req): Pmr<UserResponse> => {
                const result = await beeswax.userWithToken(
                    req,
                    database,
                    sessions,
                );
                if (!result.ok) {
                    switch (result.error) {
                        case "bad_login":
                            return {
                                status: 400,
                                body: {
                                    success: false,
                                    error: "invalid login",
                                },
                            };
                        case "db_error":
                            return {
                                status: 500,
                                body: { success: false, error: "db error" },
                            };
                        default:
                            assertUnreachable(result);
                    }
                }
                return { body: { success: true, data: result.data.user } };
            },
        ),
    );
}
