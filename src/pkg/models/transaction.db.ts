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
  id: serial().primaryKey(),
  assetID: integer().notNull(),
  reserverID: uuid().notNull(),
  createdAt: timestamp({ precision: 6, mode: "date" }).defaultNow().notNull(),
  approverID: uuid(),
  status: transactionStatus().default("RESERVE").notNull(),
  startedAt: timestamp({ precision: 6, mode: "date" }).notNull(),
  endedAt: timestamp({ precision: 6, mode: "date" }).notNull(),
});

/*
 one transaction belong to one reserver, approver, asset_id
 but can has many messages
 */
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    reserver: one(users, {
      fields: [transactions.reserverID],
      references: [users.id],
      relationName: "reserver",
    }),
    approver: one(users, {
      fields: [transactions.approverID],
      references: [users.id],
      relationName: "approver",
    }),
    messages: many(messages),
    assetId: one(assets, {
      fields: [transactions.assetID],
      references: [assets.id],
    }),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
