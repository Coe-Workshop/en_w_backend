import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { assets } from "./asset.db";
import { customType } from "drizzle-orm/pg-core";

export interface Item {
  id: number;
  name: string;
  assetIDs?: unknown;
  description: string | null;
  category?: ItemCategory | null;
  categoryID?: number | null;
  imageUrl: string | null;
}

export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: citext("name").notNull().unique(),
  description: text("description").default("อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย"),
  categoryID: integer("category_id")
    .notNull()
    .references(() => categories.id),
  imageUrl: text("image_url"),
});

//one item has one category
//one ITEM has many assets
export const itemsRelations = relations(items, ({ one, many }) => ({
  assetIDs: many(assets),
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
  id: serial("id").primaryKey(),
  name: itemCategory("name").notNull().unique(),
});

//one category can be in many item
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export type NewItem = typeof items.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type ItemCategory = (typeof itemCategory.enumValues)[number];
