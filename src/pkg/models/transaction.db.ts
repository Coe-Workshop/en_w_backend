import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
  index,
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
  id: number;
  itemName: string;
  assetID: string;
  startedAt: Date;
  endedAt: Date;
  status: transactionStatus;
  message: string;
};
export interface GetAllTransactionsByStatus {
  user: {
    phone: string;
    userName: string;
    profileUrl?: string;
  } | null;
  adminTransactions: AdminTransactions[];
}

export type AssetsStatus = {
  assetID: string;
  transactions: {
    id: number;
    status: transactionStatus;
    startedAt: Date;
    endedAt: Date;
    message: string;
    user: {
      phone: string;
      userName: string;
      profileUrl?: string;
    };
  };
};

export interface GetAllTransactionsByItem {
  itemName: string | null;
  description: string | null;
  categoryName: ItemCategory | null;
  imageUrl: string | null;
  assets: AssetsStatus[];
}

export interface GetReservedByItem {
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
  user: {
    phone: string;
    userName: string;
    faculty: string | null;
  };
  transactions: {
    startTime: Date;
    userTransactions: UserTransactions[];
  }[];
}

export interface transactionIdList {
  id: number;
}

export interface ConflictUser {
  userName: string;
  itemName: string | null;
  assetId: string | null;
  startedAt: Date;
  endedAt: Date;
}

export interface TransactionCheckResult {
  transactionId: number;
  isConflict: boolean;
  conflicts?: ConflictUser[];
}

export interface UpdateTransactionsConflicts {
  totalConflicts: number;
  details: TransactionCheckResult[];
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
},
  (table) => [
    index("idx_transactions_reserver_id").on(table.reserverID),
    index("idx_transactions_item_id").on(table.itemID),
    index("idx_transactions_asset_id").on(table.assetID),
    index("idx_transactions_approver_id").on(table.approverID),
    index("idx_transactions_status").on(table.status),
    index("idx_transactions_started_at").on(table.startedAt),
    index("idx_transactions_ended_at").on(table.endedAt),
    index("idx_transactions_reserver_status").on(table.reserverID, table.status),
    index("idx_transactions_item_status").on(table.itemID, table.status),
    index("idx_transactions_status_started").on(table.status, table.startedAt),
  ]);

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
