import { UserRole } from "@/pkg/models";
import z from "zod";

export const TempUser = z.object({
  id: z.string().trim().optional(),
  email: z.email().trim(),
  role: z.enum(UserRole),
});

export type TempUser = z.infer<typeof TempUser>;
