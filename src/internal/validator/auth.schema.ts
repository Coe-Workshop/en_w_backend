import { UserRoleEnum } from "../../pkg/models/user.db.js";
import z from "zod";

export const RegisterRequest = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  faculty: z.string().trim(),
  role: z.enum(UserRoleEnum),
  phone: z.string().trim().length(10),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;
