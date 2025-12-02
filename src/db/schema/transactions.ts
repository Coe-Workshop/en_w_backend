import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial } from "drizzle-orm/pg-core";

import { transaction_groups } from "./transaction_groups";
import { assets } from "./assets";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transaction_group_id: integer("transaction_group_id").notNull(),
  asset_id: integer("asset_id").notNull(),
});

//one transaction belong to one transaction group
//one transaction has one asset id
export const transactionsRelations = relations(transactions, ({ one }) => ({
  transaction_group: one(transaction_groups, {
    fields: [transactions.transaction_group_id],
    references: [transaction_groups.id],
  }),
  assets: one(assets, {
    fields: [transactions.asset_id],
    references: [assets.id],
  }),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
