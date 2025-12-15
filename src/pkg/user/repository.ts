import { eq, sql } from "drizzle-orm";
import { UserRepository } from "../domain/user";
import { users } from "../models";
import { AppErr } from "@/internal/utils/appErr";
import HttpStatus from "http-status";

const makeUserRepository = (): UserRepository => ({
  getUser: async (db, column, value) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(sql.identifier(`users"."${column}`), value));

    if (result.length === 0) {
      throw new AppErr(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND");
    }

    return result[0];
  },
});

export default makeUserRepository;
