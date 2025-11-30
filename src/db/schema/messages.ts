import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { transactions } from "./transactions";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  detail: text("detail"),
  user_id: integer("user_id").notNull(),
  transaction_id: integer("transaction_id").notNull(),
});

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

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
