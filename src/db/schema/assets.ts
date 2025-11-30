import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./items";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assets_id: text("assets_id").notNull(),
  item_id: integer("item_id").notNull(),
});

//one asset belong to one item
export const assetsRelations = relations(assets, ({ one }) => ({
  item: one(items, {
    fields: [assets.item_id],
    references: [items.id],
  }),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
