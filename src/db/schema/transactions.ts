import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

import { messages } from "./messages";
import { users } from "./users";
import { items } from "./items";

export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "approved",
  "rejected",
  "loaned",
  "returned",
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  create_at: timestamp("create_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  approve_at: timestamp("approve_at", { precision: 6, mode: "date" }),
  loan_at: timestamp("loan_at", { precision: 6, mode: "date" }),
  status: transactionStatus("status").default("pending").notNull(),
  update_at: timestamp("update_at", { precision: 6, mode: "date" }),
  item_id: integer("item_id").notNull(),
  user_approve: integer("user_approve"),
});

// one transaction can has many messages
// one transaction can has one approver
// one transaction can has one item
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    messages: many(messages),
    requester: one(users, {
      fields: [transactions.user_id],
      references: [users.id],
      relationName: "requester",
    }),
    approver: one(users, {
      fields: [transactions.user_approve],
      references: [users.id],
      relationName: "approver",
    }),
    items: one(items, {
      fields: [transactions.item_id],
      references: [items.id],
    }),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
