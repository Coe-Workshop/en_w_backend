import { pgTable, text, integer, serial, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.db";
import { transactions } from "./transaction.db";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userID: uuid("user_id").notNull(),
  detail: text("detail"),
  transactionID: integer("transaction_id").notNull(),
});

//one message belong to one user and transaction
export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userID],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [messages.transactionID],
    references: [transactions.id],
  }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
