import { NewUser, User } from "../models";

export interface AuthService {
  register: (req: NewUser) => Promise<User>;
  isRegistered: (email: string) => Promise<boolean>;
}
