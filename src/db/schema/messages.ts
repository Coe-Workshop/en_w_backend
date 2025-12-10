import { pgTable, text, integer, serial, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { transactions } from "./transactions";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  detail: text("detail"),
  transaction_id: integer("transaction_id").notNull(),
});

//one message belong to one user and transaction
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
