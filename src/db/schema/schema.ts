import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  smallint,
  primaryKey,
} from "drizzle-orm/pg-core";
import { transactionStatus, userRole, itemCategory } from "./enum_db";

/*
 * for me
 Generate migrations: npx drizzle-kit generate
 Apply migrations: npx drizzle-kit migrate
*/

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  role: userRole("role"),
  created_at: timestamp("created_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at_at", { precision: 6, mode: "date" }),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  create_at: timestamp("create_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  approve_at: timestamp("approve_at", { precision: 6, mode: "date" }),
  loan_at: timestamp("loan_at", { precision: 6, mode: "date" }),
  status: transactionStatus("status").default("pending").notNull(),
  update_at: timestamp("update_at", { precision: 6, mode: "date" }),
  item_id: integer("item_id").notNull(),
  user_approve: integer("user_approve"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  detail: text("detail"),
  user_id: integer("user_id").notNull(),
  transaction_id: integer("transaction_id").notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(
    "This item has no description provided",
  ),
  image_url: text("image_url"),
  category_id: integer("category_id").notNull(),
  total: smallint("total").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: itemCategory("name").notNull(),
});

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

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assets_id: text("assets_id").notNull(),
  item_id: integer("item_id").notNull(),
});

// no need to manual interface now with this!
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
