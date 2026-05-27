import { err, ok, type Result, type UserWithId } from "@avarts/shared";
import type { Database } from "../Database.ts";
import type { Sessions } from "../Session.ts";
import bcrypt from "bcryptjs";

type LoginError = "db_error" | "bad_login";

export async function login(
    request: { username: string; password: string },
    database: Database,
    sessions: Sessions,
): Promise<Result<{ token: string }, LoginError>> {
    const dbResult = await database.getUserByUsername(
        request.username,
    );
    if (!dbResult.ok) {
        return err("db_error");
    }

    const user = dbResult.data;
    if (user === null) {
        return err("bad_login");
    }
    const bcryptResult = await bcrypt.compare(
        request.password,
        user.password,
    );
    if (!bcryptResult) {
        return err("bad_login");
    }

    const token = sessions.addSession(user.id);
    return ok({ token });
}

type LogoutError = "bad_login";

export async function logout(
    request: { token: string },
    sessions: Sessions,
): Promise<Result<void, LogoutError>> {
    const user = sessions.userIdFromToken(request.token);
    if (user === null) {
        return err("bad_login");
    }

    sessions.removeSession(user);
    return await Promise.resolve(ok());
}

type RegisterError = "username_taken" | "db_error";

export async function register(
    request: { username: string; password: string },
    database: Database,
): Promise<Result<void, RegisterError>> {
    const dbResult = await database.getUserByUsername(
        request.username,
    );
    if (!dbResult.ok) {
        return err("db_error");
    }
    const user = dbResult.data;
    if (user !== null) {
        return err("username_taken");
    }
    const hashedPassword = await bcrypt.hash(request.password, 12);
    const result = await database.addUser({
        username: request.username,
        password: hashedPassword,
    });
    if (!result.ok) {
        return err("db_error");
    }
    return ok();
}

type UserWithTokenError = "bad_login" | "db_error";

export async function userWithToken(
    request: { token: string },
    database: Database,
    sessions: Sessions,
): Promise<Result<{ user: UserWithId }, UserWithTokenError>> {
    const userId = sessions.userIdFromToken(request.token);
    if (userId === null) {
        return err("bad_login");
    }

    const userResult = await database.getUserById(userId);
    if (!userResult.ok) {
        return err("db_error");
    }
    if (userResult.data === null) {
        return err("bad_login");
    }
    return ok({ user: userResult.data });
}

type UserWithIdError = "bad_user" | "db_error";

export async function userWithId(
    request: { id: number },
    database: Database,
): Promise<Result<{ user: UserWithId }, UserWithIdError>> {
    const userResult = await database.getUserById(request.id);
    if (!userResult.ok) {
        console.error(userResult.error);
        return err("db_error");
    }
    if (userResult.data === null) {
        return err("bad_user");
    }
    return ok({ user: userResult.data });
}
