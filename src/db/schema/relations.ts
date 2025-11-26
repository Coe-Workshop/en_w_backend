import { relations } from "drizzle-orm";
import {
  users,
  transactions,
  messages,
  items,
  categories,
  assets,
  itemsToCategories,
} from "./schema";

// user can has many messages, transactions time and admin can approve many transaction
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  req_transactions: many(transactions, {
    relationName: "requester",
  }),
  approved_transactions: many(transactions, {
    relationName: "approver",
  }),
}));

// one message belong to one specific user and transaction
export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.user_id],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [messages.transaction_id],
    references: [transactions.id],
  }),
}));

// one transaction can has many messages
// one transaction can has one approver
// one transaction can has one item
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    messages: many(messages),
    requester: one(users, {
      fields: [transactions.user_id],
      references: [users.id],
      relationName: "requester",
    }),
    approver: one(users, {
      fields: [transactions.user_approve],
      references: [users.id],
      relationName: "approver",
    }),
    items: one(items, {
      fields: [transactions.item_id],
      references: [items.id],
    }),
  }),
);

//one item has one asset
//one item can be in many transaction (overtime right ?)
//one item can has many category
export const itemsRelations = relations(items, ({ one, many }) => ({
  asset: one(assets),
  transaction: many(transactions),
  categories: many(itemsToCategories),
}));

//one category can be in many item
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(itemsToCategories),
}));

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

//one asset belong to one item
export const assetsRelations = relations(assets, ({ one }) => ({
  item: one(items, {
    fields: [assets.item_id],
    references: [items.id],
  }),
}));
