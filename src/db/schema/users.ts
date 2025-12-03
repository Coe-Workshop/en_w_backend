import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { messages } from "./messages";
import { timelines } from "./timeline";
import { transaction_groups } from "./transaction_groups";

export const userRole = pgEnum("user_role", ["BORROWER", "ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  role: userRole("role"),
  created_at: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at_at", { precision: 6, mode: "date" }),
});

// user can has many timelines
// user can be many 'requested user'
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  timelines: many(timelines),
  transaction_groups: many(transaction_groups),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
