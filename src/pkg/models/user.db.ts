import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { messages } from "./message.db";
import { transactions } from "./transaction.db";

export interface GoogleUser {
  googleId: string;
  email: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
}

export const userRole = pgEnum("user_role", ["RESERVER", "ADMIN"]);
export const UserRoleEnum = userRole.enumValues;

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    prefix: text("prefix").notNull(),
    email: text("email").notNull().unique(),
    isUniStudent: boolean("is_uni_student").notNull(),
    faculty: text("faculty"),
    role: userRole("role").notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { precision: 6, mode: "date" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 6, mode: "date" }),
  },
  (table) => [
    uniqueIndex("idx_users_email").using("btree", sql`LOWER(${table.email})`),
    index("idx_trgm_email").using("gin", sql`${table.email} gin_trgm_ops`),
  ],
);

// user can has many messages, reserve and approve times
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  reservedTransactions: many(transactions, { relationName: "reserver" }),
  approvedTransactions: many(transactions, { relationName: "approver" }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRole.enumValues)[number];
