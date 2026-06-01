import z from "zod";
import { UserWithId } from "./User.ts";
import { RouteWithUserIdAndId } from "./Route.ts";
import { RunWithUserIdAndId } from "@avarts/shared";

const SuccessResponse = z.strictObject({
    success: z.literal(true),
});

const ErrorResponse = z.strictObject({
    success: z.literal(false),
    error: z.string(),
});

export const LoginResponse = SuccessResponse.extend({
    token: z.string(),
}).or(ErrorResponse);

export type LoginResponse = z.infer<typeof LoginResponse>;

export const LogoutResponse = SuccessResponse.or(ErrorResponse);

export type LogoutResponse = z.infer<typeof LogoutResponse>;

export const UserResponse = SuccessResponse.extend({
    user: UserWithId,
}).or(ErrorResponse);

export type UserResponse = z.infer<typeof UserResponse>;

export const RegisterResponse = SuccessResponse.or(ErrorResponse);

export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const RoutesResponse = SuccessResponse.extend({
    routes: z.array(RouteWithUserIdAndId),
}).or(ErrorResponse);

export type RoutesResponse = z.infer<typeof RoutesResponse>;

export const AddRouteResponse = SuccessResponse.or(ErrorResponse);

export type AddRouteResponse = z.infer<typeof AddRouteResponse>;

export const RouteResponse = SuccessResponse.extend({
    route: RouteWithUserIdAndId,
}).or(ErrorResponse);

export type RouteResponse = z.infer<typeof RouteResponse>;

export const AddRunResponse = SuccessResponse.or(ErrorResponse);

export type AddRunResponse = z.infer<typeof AddRunResponse>;

export const RunsOnRouteResponse = SuccessResponse.extend({
    runs: z.array(RunWithUserIdAndId),
}).or(ErrorResponse);

export type RunsOnRouteResponse = z.infer<typeof RunsOnRouteResponse>;

export const UserFromIdResponse = SuccessResponse.extend({
    user: UserWithId,
}).or(ErrorResponse);

export type UserFromIdResponse = z.infer<typeof UserFromIdResponse>;

export const DeleteRouteResponse = SuccessResponse.or(ErrorResponse);

export type DeleteRouteResponse = z.infer<typeof DeleteRouteResponse>;
