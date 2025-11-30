import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./messages";
import { transactions } from "./transactions";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  role: userRole("role"),
  created_at: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at_at", { precision: 6, mode: "date" }),
});

// user can has many messages, transactions time and admin can approve many transaction
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  req_transactions: many(transactions, {
    relationName: "requester",
  }),
  approved_transactions: many(transactions, {
    relationName: "approver",
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
