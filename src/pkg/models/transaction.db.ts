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
  assetID: integer("asset_id")
    .notNull()
    .references(() => assets.id),
  reserverID: uuid("reserver_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("create_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  approverID: uuid("approver_id").references(() => users.id),
  status: transactionStatus("status").default("RESERVE").notNull(),
  startedAt: timestamp("started_at", { precision: 6, mode: "date" }).notNull(),
  endedAt: timestamp("ended_at", { precision: 6, mode: "date" }).notNull(),
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
