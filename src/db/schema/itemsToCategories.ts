import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { itemsTable } from "./items";
import { categories } from "./categories";

export const itemsToCategories = pgTable(
  "items_to_categories",
  {
    item_id: integer("item_id")
      .notNull()
      .references(() => itemsTable.id, { onDelete: "cascade" }),
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.item_id, table.category_id] }),
  }),
);

//many to many relations between items and categories
export const itemsToCategoriesRelations = relations(
  itemsToCategories,
  ({ one }) => ({
    item: one(itemsTable, {
      fields: [itemsToCategories.item_id],
      references: [itemsTable.id],
    }),
    category: one(categories, {
      fields: [itemsToCategories.category_id],
      references: [categories.id],
    }),
  }),
);
