import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { itemsToCategories } from "./itemsToCategories";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย"),
  image_url: text("image_url"),
});

//one item has one asset
//one item can has many category
export const itemsRelations = relations(items, ({ one, many }) => ({
  asset: one(assets),
  categories: many(itemsToCategories),
}));

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
