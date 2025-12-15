import { DB } from "@/config/drizzle";
import { UserRepository, UserService } from "../domain/user";

const userService = (db: DB, userRepository: UserRepository): UserService => ({
  getUserByEmail: async (email) => {
    return await db.transaction(async (tx) => {
      return await userRepository.getUser(tx, "email", email);
    });
  },
});

export default userService;
