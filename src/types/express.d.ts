import { TempUser } from "@/internal/validator/user.schema";

declare global {
  namespace Express {
    interface User extends TempUser {}
  }
}
