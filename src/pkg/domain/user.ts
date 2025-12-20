import { DBTransaction } from "@/config/drizzle";
import { NewUser, User } from "../models";

export interface UserRepository {
  getUser: (db: DBTransaction, column: string, value: any) => Promise<User>;
  createUser: (db: DBTransaction, data: NewUser) => Promise<User>;
  deleteUserByID: (db: DBTransaction, id: string) => Promise<User>;
  updateUser: (db: DBTransaction, data: Partial<User>) => Promise<User>;
}

export interface UserService {
  getUserByID: (id: string) => Promise<User>;
  createUser: (req: NewUser) => Promise<User>;
  deleteUserByID: (id: string) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
}
