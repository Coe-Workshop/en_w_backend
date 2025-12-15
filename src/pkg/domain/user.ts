import { DBTransaction } from "@/config/drizzle";
import { User } from "../models";

export interface UserRepository {
  getUser: (db: DBTransaction, column: string, value: any) => Promise<User>;
}

export interface UserService {
  getUserByEmail: (email: string) => Promise<User>;
}
