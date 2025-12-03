import { relations } from "drizzle-orm";
import { pgTable, serial, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { transaction_groups } from "./transaction_groups";

export const timelines = pgTable("timelines", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
});

// one timeline belong to one user
// one timeline can has many transaction_groups
export const timelinesRelations = relations(timelines, ({ one, many }) => ({
  user: one(users, {
    fields: [timelines.user_id],
    references: [users.id],
  }),
  transaction_groups: many(transaction_groups),
}));

export type timelines = typeof timelines.$inferSelect;
export type Newtimelines = typeof timelines.$inferInsert;
