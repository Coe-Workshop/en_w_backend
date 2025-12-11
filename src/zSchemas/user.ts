import z from "zod";
import { fa } from "zod/v4/locales";

export const CreateUserRequest = z.object({
    first_name: z
        .string()
        .trim()
        .min(2)
        .max(50),
    last_name : z
        .string()
        .trim()
        .min(2)
        .max(50),
    email: z
        .string()
        .trim()
        .email(),
    faculty: z
        .string()
        .trim(),
    phone: z
        .string()
        .trim(),
    role: z
        .enum(["BORROWER", "ADMIN"]),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequest>;