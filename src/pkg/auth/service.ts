import { DB } from "@/config/drizzle";
import { UserRepository } from "../domain/user";
import { AuthService } from "../domain/auth";
import { AppErr } from "@/utils/appErr";
import HttpStatus from "http-status";

const makeAuthService = (
  db: DB,
  userRepository: UserRepository,
): AuthService => ({
  register: async (req) => {
    return await db.transaction(async (tx) => {
      return await userRepository.createUser(tx, req);
    });
  },
  isRegistered: async (email) => {
    return await db.transaction(async (tx) => {
      try {
        const user = await userRepository.getUser(tx, "email", email);
        return !!user;
      } catch (err) {
        if (
          err instanceof AppErr &&
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "RECORD_NOT_FOUND"
        ) {
          return false;
        }
        return true;
      }
    });
  },
});

export default makeAuthService;
