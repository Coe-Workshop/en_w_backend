import { UserRole } from "@/pkg/models";
import z from "zod";

export const LoginRequest = z.object({
  email: z.email().trim(),
  password: z.string().min(8).trim(),
});

export const RegisterRequest = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  prefix: z.string().trim(),
  isUniStudent: z.boolean(),
  faculty: z.string().trim().optional(),
  role: z.enum(UserRole),
  phone: z.string().trim().length(10),
  password: z.string().min(8).trim().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequest>;
export type RegisterRequest = z.infer<typeof RegisterRequest>;
