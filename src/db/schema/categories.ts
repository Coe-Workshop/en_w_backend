import { pgEnum, pgTable, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./items";

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

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
