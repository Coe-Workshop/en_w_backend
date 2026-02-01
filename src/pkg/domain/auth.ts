import { LoginRequest } from "@/internal/validator/auth.schema";
import { NewUser, User } from "../models";

export interface AuthService {
  loginEmailPassword: (req: LoginRequest) => Promise<User>;
  register: (req: NewUser) => Promise<User>;
  isRegistered: (email: string) => Promise<boolean>;
}
