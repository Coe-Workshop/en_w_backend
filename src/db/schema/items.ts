import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { categories } from "./categories";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย"),
  category_id: integer("category_id").notNull(),
  image_url: text("image_url"),
});

//one item has one category
//one ITEM has many assets
export const itemsRelations = relations(items, ({ one, many }) => ({
  assetId: many(assets),
  category: one(categories, {
    fields: [items.category_id],
    references: [categories.id],
  }),
}));

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
