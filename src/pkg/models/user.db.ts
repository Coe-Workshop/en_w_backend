import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  faculty: text("faculty").notNull(),
  role: userRole("role"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { precision: 6, mode: "date" }),
});

// user can has many messages, reserve and approve times
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  reservedTransactions: many(transactions, { relationName: "reserver" }),
  approvedTransactions: many(transactions, { relationName: "approver" }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRole.enumValues)[number];
