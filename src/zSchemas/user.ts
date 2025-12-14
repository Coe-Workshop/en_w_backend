import z from "zod";
import { fa } from "zod/v4/locales";
import { userRole } from "../db/schema/users";

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
        .enum(userRole.enumValues),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequest>;