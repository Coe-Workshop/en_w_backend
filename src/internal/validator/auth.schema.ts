import { UserRoleEnum } from "../../pkg/models/user.db.js";
import z from "zod";

export const RegisterRequest = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  prefix: z.string().trim(),
  isUniStudent: z.boolean(),
  faculty: z.string().trim().optional(),
  role: z.enum(UserRoleEnum),
  phone: z.string().trim().length(10),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;
