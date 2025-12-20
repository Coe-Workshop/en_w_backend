import { DBTransaction } from "@/config/drizzle";
import { NewUser, User } from "../models";
import { CreateUserRequest } from "@/internal/validator/user.schema"; // Importing CreateUserRequest

export interface UserRepository {
  createUser: (db: DBTransaction, data: NewUser) => Promise<User>;
  deleteUserByID: (db: DBTransaction, id: string) => Promise<User>;
  updateUser: (db: DBTransaction, data: Partial<User>) => Promise<User>;
  getUserByID: (db: DBTransaction, id: string) => Promise<User>;
}

export interface UserService {
  getUserByID: (id: string) => Promise<User>;
  createUser: (req: CreateUserRequest) => Promise<User>;
  deleteUserByID: (id: string) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
}
