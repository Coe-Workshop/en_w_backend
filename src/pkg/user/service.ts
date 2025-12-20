import { DB } from "@/config/drizzle";
import { UserRepository, UserService } from "../domain/user";

const makeUserService = (
  db: DB,
  userRepository: UserRepository,
): UserService => ({
  createUser: async (req) => {
    return await db.transaction(async (tx) => {
      return await userRepository.createUser(tx, req);
    });
  },

  deleteUserByID: async (id) => {
    console.log("service id", id);
    return await db.transaction(async (tx) => {
      return await userRepository.deleteUserByID(tx, id);
    });
  },

  updateUser: async (data) => {
    return await db.transaction(async (tx) => {
      return await userRepository.updateUser(tx, data);
    });
  },

  getUserByID: async (id) => {
    return await db.transaction(async (tx) => {
      return await userRepository.getUserByID(tx, id);
    });
  },
});

export default makeUserService;
