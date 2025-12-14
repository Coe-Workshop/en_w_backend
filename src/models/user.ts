import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { messages } from "./message";
import { transactions } from "./transaction";

export const userRole = pgEnum("user_role", ["BORROWER", "ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  faculty: text("faculty").notNull(),
  role: userRole("role"),
  phone: varchar("phone", { length: 32 }),
  created_at: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at_at", { precision: 6, mode: "date" }),
});

// user can has many messages, reserve and approve times
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  reservedTransactions: many(transactions, { relationName: "reserver" }),
  approvedTransactions: many(transactions, { relationName: "approver" }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
