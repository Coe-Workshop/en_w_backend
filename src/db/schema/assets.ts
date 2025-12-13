import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { items } from "./items";
import { transactions } from "./transactions";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assets_id: text("assets_id").notNull(),
  item_id: integer("item_id")
    .notNull()
    .references(() => items.id, {
      onDelete: "cascade",
    }),
});

//one asset belong to one item
//one asset can be in many transactions
export const assetsRelations = relations(assets, ({ one, many }) => ({
  item: one(items, {
    fields: [assets.item_id],
    references: [items.id],
  }),
  transactions: many(transactions),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
