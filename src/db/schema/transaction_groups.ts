import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timelines } from "./timeline";
import { users } from "./users";
import { messages } from "./messages";
import { transactions } from "./transactions";

export const transaction_groups_status = pgEnum("transaction_groups_status", [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "LOANED",
  "RETURNED",
]);

export const transaction_groups = pgTable("transaction_groups", {
  id: serial("id").primaryKey(),
  create_at: timestamp("create_at", { precision: 6, mode: "date" })
    .defaultNow()
    .notNull(),
  requested_user: uuid("requested_user").notNull(),
  timeline_id: integer("timeline_id").notNull(),
  status: transaction_groups_status("status").default("RETURNED").notNull(),
});

//one transaction_group belong to one user
//one transaction_group belong to one timeline
//one transaction_groups can has many messages (very very temporary!)
//one transaction_group can has many transactions
export const transactionGroupsRelations = relations(
  transaction_groups,
  ({ one, many }) => ({
    timeline: one(timelines, {
      fields: [transaction_groups.timeline_id],
      references: [timelines.id],
    }),
    user: one(users, {
      fields: [transaction_groups.requested_user],
      references: [users.id],
    }),
    messages: many(messages),
    transactions: many(transactions),
  }),
);

export type transaction_groups = typeof transaction_groups.$inferSelect;
export type NewTransactionGroups = typeof transaction_groups.$inferInsert;
