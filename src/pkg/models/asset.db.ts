import { integer, pgTable, primaryKey, serial, text, timestamp, index } from "drizzle-orm/pg-core";
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
},
(table) => [
  index("idx_assets_deleted_at").on(table.deletedAt),
]);

export const assetsToItems = pgTable("assets_to_items", {
  assetID: integer("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  itemID: integer("item_id")
    .notNull()
    .references(() => items.id),
}, (table) => [
  primaryKey({ columns: [table.assetID, table.itemID] }),
  index("idx_assets_to_items_item_id").on(table.itemID),
  index("idx_assets_to_items_asset_id").on(table.assetID),
]);

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
