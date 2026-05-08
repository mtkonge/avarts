import * as z from "zod";

export const User = z.strictObject({
    username: z.string(),
    password: z.string(),
});

export const UserWithId = User.extend({
    id: z.number(),
});

export type User = z.infer<typeof User>;
export type UserWithId = z.infer<typeof UserWithId>;
