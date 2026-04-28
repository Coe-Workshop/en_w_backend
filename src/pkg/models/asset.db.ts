import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./item.db";
import { transactions } from "./transaction.db";

export interface Asset {
  id: number | number[];
  assetID: string[] | string;
  item: {
    id: number;
    name: string | null;
  } | null;
}

export interface NewAsset {
  itemID: number;
  assetID: string[];
}

export interface delAsset {
  id: number;
}

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetID: text("asset_id").notNull().unique(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const assetsToItems = pgTable("assets_to_items", {
  assetID: integer("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  itemID: integer("item_id")
    .notNull()
    .references(() => items.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.assetID, table.itemID] }),
}));

export const assetsToItemsRelations = relations(assetsToItems, ({ one }) => ({
  asset: one(assets, {
    fields: [assetsToItems.assetID],
    references: [assets.id],
  }),
  item: one(items, {
    fields: [assetsToItems.itemID],
    references: [items.id],
  }),
}));

//one asset CAN belong to many item
//one asset can be in many transactions
export const assetsRelations = relations(assets, ({ many }) => ({
  items: many(assetsToItems),
  transactions: many(transactions),
}));

// export type Asset = typeof assets.$inferSelect;
// export type NewAsset = typeof assets.$inferInsert;
// export type delAsset = typeof assets.$inferInsert;
