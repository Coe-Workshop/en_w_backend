import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { assets } from "./asset.db";

export interface Item {
  id: number;
  name: string;
  assetsID?: unknown;
  description: string | null;
  category?: ItemCategory;
  categoryID?: number;
  imageUrl: string | null;
}

export const items = pgTable("items", {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().default("อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย"),
  categoryID: integer().notNull(),
  imageUrl: text(),
});

//one item has one category
//one ITEM has many assets
export const itemsRelations = relations(items, ({ one, many }) => ({
  assetID: many(assets),
  category: one(categories, {
    fields: [items.categoryID],
    references: [categories.id],
  }),
}));

export const itemCategory = pgEnum("item_category", [
  "MACHINE",
  "HANDTOOL",
  "ELECTRONIC",
  "OTHER",
]);

export const categories = pgTable("categories", {
  id: serial().primaryKey(),
  name: itemCategory().notNull().unique(),
});

//one category can be in many item
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export type NewItem = typeof items.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type ItemCategory = (typeof itemCategory.enumValues)[number];
