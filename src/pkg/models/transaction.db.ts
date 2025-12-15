import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { messages } from "./message.db";
import { assets } from "./asset.db";

export const transactionStatus = pgEnum("transaction_status", [
  "REJECT",
  "RESERVE",
  "APPROVE",
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  asset_id: integer("asset_id").notNull(),
  reserver_id: uuid("reserver_id").notNull(),
  created_at: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  approver_id: uuid("approver_id"),
  status: transactionStatus("status").default("RESERVE").notNull(),
  start_at: timestamp("start_at", { precision: 6, mode: "date" }).notNull(),
  end_at: timestamp("start_at", { precision: 6, mode: "date" }).notNull(),
});

/*
 one transaction belong to one reserver, approver, asset_id
 but can has many messages
 */
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    reserver: one(users, {
      fields: [transactions.reserver_id],
      references: [users.id],
      relationName: "reserver",
    }),
    approver: one(users, {
      fields: [transactions.approver_id],
      references: [users.id],
      relationName: "approver",
    }),
    messages: many(messages),
    assetId: one(assets, {
      fields: [transactions.asset_id],
      references: [assets.id],
    }),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
