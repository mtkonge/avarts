import * as z from "zod";

export const User = z.strictObject({
    username: z.string(),
});

export const UserWithPassword = z.strictObject({
    username: z.string(),
    password: z.string(),
});

export const UserWithId = User.extend({
    id: z.number(),
});

export const UserWithPasswordAndId = UserWithPassword.extend({
    id: z.number(),
});

export type User = z.infer<typeof User>;
export type UserWithPassword = z.infer<typeof UserWithPassword>;
export type UserWithId = z.infer<typeof UserWithId>;
export type UserWithPasswordAndId = z.infer<typeof UserWithPasswordAndId>;
