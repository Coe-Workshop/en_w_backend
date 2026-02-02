import { DB } from "@/config/drizzle";
import { UserRepository, UserService } from "../domain/user";

const makeUserService = (
  db: DB,
  userRepository: UserRepository,
): UserService => ({
  getUserByID: async (id) => {
    const { password, ...userWithoutPass }  = await db.transaction(async (tx) => {
      return await userRepository.getUser(tx, "id", id);
    });

    return userWithoutPass;
  },

  getUserByEmail: async (email) => {
    const { password, ...userWithoutPass} = await db.transaction(async (tx) => {
      return await userRepository.getUser(tx, "email", email);
    });

    return userWithoutPass;
  },

  createUser: async (req) => {
    return await db.transaction(async (tx) => {
      return await userRepository.createUser(tx, req);
    });
  },

  deleteUserByID: async (id) => {
    return await db.transaction(async (tx) => {
      return await userRepository.deleteUserByID(tx, id);
    });
  },

  updateUser: async (data) => {
    return await db.transaction(async (tx) => {
      return await userRepository.updateUser(tx, data);
    });
  },
});

export default makeUserService;
