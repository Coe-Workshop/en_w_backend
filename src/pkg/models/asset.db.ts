import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./item.db";
import { transactions } from "./transaction.db";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetID: text("asset_id").notNull(),
  itemID: integer("item_id")
    .notNull()
    .references(() => items.id),
});

//one asset CAN belong to many item
//one asset can be in many transactions
export const assetsRelations = relations(assets, ({ many }) => ({
  items: many(items),
  transactions: many(transactions),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
