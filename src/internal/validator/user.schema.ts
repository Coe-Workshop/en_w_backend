import e from "express";
import { UserRoleEnum } from "../../pkg/models/user.db.js";
import z from "zod";

export const CreateUserRequest = z.object({
    first_name: z
        .string()
        .min(2)
        .trim(),
    last_name: z
        .string()
        .min(2)
        .trim(),
    email: z
        .string()
        .email(),
    faculty: z
        .string()
        .trim(),
    role: z
        .enum(UserRoleEnum),
    phone: z
        .string()
        .trim()
        .length(10),
});

export const UpdateUserRequest = CreateUserRequest;

export type CreateUserRequest = z.infer<typeof CreateUserRequest>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequest>;