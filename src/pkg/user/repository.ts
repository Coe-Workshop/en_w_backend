import { eq, sql, DrizzleQueryError, and } from "drizzle-orm";
import { UserRepository } from "../domain/user";
import { users } from "../models";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import { DatabaseError } from "pg";
import { tr } from "zod/v4/locales";
import e from "express";

const makeUserRepository = (): UserRepository => ({
  createUser: async (db, data) => {
    try {
      const result = await db
        .insert(users)
        .values(data)
        .returning();

      return result[0];
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError &&
        err.cause.code === "23505"
      ) {
        throw new AppErr(HttpStatus.CONFLICT, "USER_EMAIL_ALREADY_EXIST");
      }
      throw err;
    }
  },

  deleteUserByID: async (db, id) => {
    try {
      const result = await db
        .delete(users)
        .where(eq(users.id, String(id)))
        .returning();
      return result[0];
    } catch (err) {
      throw err;
    }
  },

  updateUser: async (db, data) => {
    try {

      const check_Email = await db
        .select()
        .from(users)
        .where(
          eq(users.email, String(data.email))
        );
      const conditions = [
        eq(users.email, String(data.email)),
        eq(users.first_name, String(data.first_name)),
        eq(users.last_name, String(data.last_name)),
        eq(users.faculty, String(data.faculty)),
        eq(users.phone, String(data.phone)),
      ];

      if (data.role !== undefined && data.role !== null) {
        conditions.push(eq(users.role, data.role));
      }

      const check_Same_Data = await db
        .select()
        .from(users)
        .where(and(...conditions));

      if (check_Email.length > 0 && check_Same_Data.length === 0) {
      const result = await db
        .update(users)
        .set(data)
        .where(eq(users.email, String(data.email)))
        .returning();
      return result[0];
      } else if (check_Same_Data.length > 0 && check_Email.length > 0) {
        throw new AppErr(HttpStatus.CONFLICT, "NO_CHANGES_DETECTED");
      } else {
        throw new AppErr(HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
      }
    } catch (err) {
      if (err instanceof DrizzleQueryError) {
        throw new AppErr(HttpStatus.INTERNAL_SERVER_ERROR, "ERROR_UPDATING_USER");
      } else {
        throw err;
      }
    }
  },

  getUserByID: async (db, id) => {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, String(id)));
      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
      }
      return result[0];
    } catch (err) {
      if (err instanceof DrizzleQueryError) {
        throw new AppErr(HttpStatus.INTERNAL_SERVER_ERROR, "ERROR_GETTING_USER");
      } else {
        throw err;
      }
    }
  },
});

export default makeUserRepository;
