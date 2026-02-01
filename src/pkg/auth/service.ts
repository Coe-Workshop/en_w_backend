import { DB } from "@/config/drizzle";
import { AuthService } from "../domain/auth";
import { AppErr } from "@/utils/appErr";
import HttpStatus from "http-status";
import { UserRepository } from "../domain/user";

const makeAuthService = (
  db: DB,
  userRepository: UserRepository
): AuthService => ({
  loginEmailPassword: async (req) => {
    return await db.transaction(async (tx) => {
      try {
	const { email } = req;
	const user = await userRepository.getUser(tx, "email", email);
	if (!user.password) throw new AppErr(HttpStatus.UNAUTHORIZED, "USER_DOES_NOT_HAVE_CREDENTIALS");
	const isCorrectPassword = await userRepository.checkPassword(user.password, req.password);
	if (!isCorrectPassword) {
	  throw new AppErr(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
	}
	return user;
      } catch (err) {
	throw err;
      }
    })
  },
		  
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
	// TODO: should I just throw?
        return false;
      }
    });
  },
});

export default makeAuthService;
