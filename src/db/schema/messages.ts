import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { transaction_groups } from "./transaction_groups";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  detail: text("detail"),
  user_id: integer("user_id").notNull(),
  transaction_id: integer("transaction_id").notNull(),
});

//one message belong to one user and transaction_groups
export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.user_id],
    references: [users.id],
  }),
  transaction_group: one(transaction_groups, {
    fields: [messages.transaction_id],
    references: [transaction_groups.id],
  }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
