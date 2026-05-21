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

export const RouteRequest = z.strictObject({ id: z.number() });

export type RouteRequest = z.infer<typeof RouteRequest>;

export const RoutesRequest = z.null();

export type RoutesRequest = z.infer<typeof RouteRequest>;

export const RunsOnRouteRequest = z.strictObject({ routeId: z.number() });

export type RunsOnRouteRequest = z.infer<typeof RunsOnRouteRequest>;

export const UserFromIdRequest = z.strictObject({ id: z.number() });

export type UserFromIdRequest = z.infer<typeof UserFromIdRequest>;
