import z from "zod";
import { UserWithId } from "./User.ts";
import { RouteWithUserIdAndId } from "./Route.ts";
import { RunWithUserIdAndId } from "@avarts/shared";

const GenericErrorResponse = z.strictObject({
    success: z.literal(false),
    error: z.string(),
});

export const LoginResponse = z.strictObject({
    success: z.literal(true),
    token: z.string(),
}).or(GenericErrorResponse);

export type LoginResponse = z.infer<typeof LoginResponse>;

export const LogoutResponse = z.strictObject({
    success: z.literal(true),
}).or(GenericErrorResponse);

export type LogoutResponse = z.infer<typeof LogoutResponse>;

export const UserResponse = z.strictObject({
    success: z.literal(true),
    data: UserWithId,
}).or(GenericErrorResponse);

export type UserResponse = z.infer<typeof UserResponse>;

export const RegisterResponse = z.strictObject({
    success: z.literal(true),
}).or(GenericErrorResponse);

export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const RoutesResponse = z.strictObject({
    success: z.literal(true),
    data: z.array(RouteWithUserIdAndId),
}).or(GenericErrorResponse);

export type RoutesResponse = z.infer<typeof RoutesResponse>;

export const AddRouteResponse = z.strictObject({
    success: z.literal(true),
}).or(GenericErrorResponse);

export type AddRouteResponse = z.infer<typeof AddRouteResponse>;

export const RouteResponse = z.strictObject({
    success: z.literal(true),
    data: RouteWithUserIdAndId,
}).or(GenericErrorResponse);

export type RouteResponse = z.infer<typeof RouteResponse>;

export const AddRunResponse = z.strictObject({
    success: z.literal(true),
}).or(GenericErrorResponse);

export type AddRunResponse = z.infer<typeof AddRunResponse>;

export const RunsOnRouteResponse = z.strictObject({
    success: z.literal(true),
    data: z.array(RunWithUserIdAndId),
}).or(GenericErrorResponse);

export type RunsOnRouteResponse = z.infer<typeof RunsOnRouteResponse>;
