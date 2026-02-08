import {
  LoginRequest,
  RegisterRequest,
} from "@/internal/validator/auth.schema";
import { User } from "../models";

export interface AuthService {
  loginEmailPassword: (req: LoginRequest) => Promise<User>;
  register: (req: RegisterRequest & { email: string }) => Promise<User>;
  isRegistered: (email: string) => Promise<boolean>;
}
