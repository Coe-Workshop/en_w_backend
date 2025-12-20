import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./item.db";
import { transactions } from "./transaction.db";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetsID: text("assets_id").notNull(),
  itemID: integer("item_id")
    .notNull()
    .references(() => items.id),
});

//one asset belong to one item
//one asset can be in many transactions
export const assetsRelations = relations(assets, ({ one, many }) => ({
  item: one(items, {
    fields: [assets.itemID],
    references: [items.id],
  }),
  transactions: many(transactions),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
