import z from "zod";
import { Route } from "./Route.ts";
import { Run } from "./Run.ts";

export const AddRouteRequest = z.strictObject({
    route: Route,
    token: z.string(),
});

export type AddRouteRequest = z.infer<typeof AddRouteRequest>;

export const LoginRequest = z.strictObject({
    username: z.string(),
    password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequest>;

export const LogoutRequest = z.strictObject({
    token: z.string(),
});

export type LogoutRequest = z.infer<typeof LogoutRequest>;

export const RegisterRequest = z.strictObject({
    username: z.string(),
    password: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const UserRequest = z.strictObject({
    token: z.string(),
});

export type UserRequest = z.infer<typeof UserRequest>;

export const AddRunRequest = z.strictObject({
    token: z.string(),
    run: Run,
});

export type AddRunRequest = z.infer<typeof AddRunRequest>;
