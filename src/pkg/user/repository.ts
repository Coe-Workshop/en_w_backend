import { eq, sql } from "drizzle-orm";
import { UserRepository } from "../domain/user";
import { users } from "../models";

const userRepository = (): UserRepository => ({
  getUser: async (db, column, value) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(sql.identifier(`users"."${column}`), value));
    return result[0];
  },
});

export default userRepository;
