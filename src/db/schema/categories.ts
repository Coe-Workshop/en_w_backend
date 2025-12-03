import { pgEnum, pgTable, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { itemsToCategories } from "./itemsToCategories";

export const itemCategory = pgEnum("item_category", [
  "MACHINE",
  "MEASUREMENT",
  "ELECTRONIC",
  "OTHER",
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: itemCategory("name").notNull(),
});

//one category can be in many item
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(itemsToCategories),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
