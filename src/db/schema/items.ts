import { pgTable, serial, text, smallint, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { transactions } from "./transactions";
import { itemsToCategories } from "./itemsToCategories";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(
    "This item has no description provided",
  ),
  image_url: text("image_url"),
  //category_id: integer("category_id").notNull(),
  total: smallint("total").notNull(),
});

//one item has one asset
//one item can be in many transaction (overtime right ?)
//one item can has many category
export const itemsRelations = relations(items, ({ one, many }) => ({
  asset: one(assets),
  transaction: many(transactions),
  categories: many(itemsToCategories),
}));

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
