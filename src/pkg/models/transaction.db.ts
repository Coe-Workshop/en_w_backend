import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { messages } from "./message.db";
import { assets } from "./asset.db";
import { ItemCategory, items } from "./item.db";

export const transactionStatus = pgEnum("transaction_status", [
  "REJECT",
  "RESERVE",
  "APPROVE",
]);

export interface Transaction {
  id: number;
  assetID: number;
  itemID: number;
  reserverID: string;
  approverID?: string | null;
  status: transactionStatus;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date;
  message?: string;
}

export type AdminTransactions = {
  itemName: string;
  assetID: string;
  startedAt: Date;
  endedAt: Date;
  status: transactionStatus;
};
export interface GetAllTransactionsByDate {
  user: {
    phone: string;
    profileUrl?: string; // idk wa bro
    userName: string;
  } | null;
  adminTransactions: AdminTransactions[];
}

export type AssetsStatus = {
  user: {
    phone: string;
    userName: string;
    profileUrl?: string; // idk yet
  };
  assetID: string;
  transactions: {
    status: transactionStatus;
    startedAt: Date;
    endedAt: Date;
    message: string;
  };
};

export interface GetAllTransactionsByItem {
  itemName: string | null;
  description: string | null;
  categoryName: ItemCategory | null;
  imageUrl: string | null;
  assets: AssetsStatus[];
}

export type UserTransactions = {
  itemName: string;
  assetID: string;
  startedAt: Date;
  endedAt: Date;
  status: transactionStatus;
  message: string;
};
export interface GetAllTransactionsByUser {
  startTime: Date;
  userTransactions: UserTransactions[];
}

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  assetID: integer("asset_id")
    .notNull()
    .references(() => assets.id),
  itemID: integer("item_id")
    .notNull()
    .references(() => items.id),
  reserverID: uuid("reserver_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("create_at", { mode: "date", withTimezone: false })
    .defaultNow()
    .notNull(),
  approverID: uuid("approver_id").references(() => users.id),
  status: transactionStatus("status").default("RESERVE").notNull(),
  startedAt: timestamp("started_at", {
    mode: "date",
    withTimezone: false,
  }).notNull(),
  endedAt: timestamp("ended_at", {
    mode: "date",
    withTimezone: false,
  }).notNull(),
});

/*
   one transaction belong to one reserver, approver, asset_id
   but can has many messages
   */
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    reserver: one(users, {
      fields: [transactions.reserverID],
      references: [users.id],
      relationName: "reserver",
    }),
    approver: one(users, {
      fields: [transactions.approverID],
      references: [users.id],
      relationName: "approver",
    }),
    messages: many(messages),
    assetId: one(assets, {
      fields: [transactions.assetID],
      references: [assets.id],
    }),
    itemID: one(items, {
      fields: [transactions.itemID],
      references: [items.id],
    }),
  }),
);

// export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type transactionStatus = (typeof transactionStatus.enumValues)[number];
