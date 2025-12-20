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
    id: uuid().primaryKey().defaultRandom(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    prefix: text().notNull(),
    email: text().notNull().unique(),
    isUniStudent: boolean().notNull(),
    faculty: text(),
    role: userRole().notNull(),
    phone: varchar({ length: 32 }).notNull(),
    createdAt: timestamp({ precision: 6, mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp({ precision: 6, mode: "date" }),
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
