import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./items";
import { categories } from "./categories";

export const itemsToCategories = pgTable(
  "items_to_categories",
  {
    item_id: integer("item_id")
      .notNull()
      .references(() => items.id),
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.item_id, table.category_id] }),
  }),
);

//many to many relations between items and categories
export const itemsToCategoriesRelations = relations(
  itemsToCategories,
  ({ one }) => ({
    item: one(items, {
      fields: [itemsToCategories.item_id],
      references: [items.id],
    }),
    category: one(categories, {
      fields: [itemsToCategories.category_id],
      references: [categories.id],
    }),
  }),
);
