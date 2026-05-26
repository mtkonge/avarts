import z from "zod";

export const SportId = z.literal([
    "rollerskates",
    "skateboard",
    "rocket",
    "car",
    "legs",
]);
export type SportId = z.infer<typeof SportId>;

type Sport = {
    name: string;
    emoji: string;
};

export function sportNames(): { [key in SportId]: Sport } {
    return {
        car: {
            name: "Car",
            emoji: "🚗",
        },
        rocket: {
            name: "Rocket",
            emoji: "🚀",
        },
        rollerskates: {
            name: "Rollerskates",
            emoji: "🛼",
        },
        skateboard: {
            name: "Skateboard",
            emoji: "🛹",
        },
        legs: {
            name: "Legs",
            emoji: "🦵",
        },
    };
}
