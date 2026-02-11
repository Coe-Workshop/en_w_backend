import { and, desc, eq, gt, lt, max, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import {
  AdminTransactions,
  assets,
  AssetsStatus,
  assetsToItems,
  categories,
  items,
  messages,
  transactions,
  users,
  UserTransactions,
} from "../models";
import { AppErr } from "@/utils/appErr";
import { TransactionRepository } from "../domain/transaction";

export const makeTransactionRepository = (): TransactionRepository => ({
  getAllTransactionsByItem: async (db, itemID) => {
    const isExist = await db.query.items.findFirst({
      where: eq(items.id, itemID),
    });
    if (!isExist) {
      throw new AppErr(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND");
    }

    const result = await db
      .select({
        itemName: items.name,
        description: items.description,
        categoryName: categories.name,
        imageUrl: items.imageUrl,
        assets: sql<AssetsStatus[]>`jsonb_agg(json_build_object(
        'assetID', ${assets.assetID},
        'transactions', COALESCE((SELECT jsonb_agg(
          json_build_object(
            'startedAt', transactions.startedAt,
            'endedAt', transactions.endedAt,
            'message', transactions.detail,
            'status', transactions.status,
            'user', json_build_object(
              'phone',  transactions.phone,
              'userName', transactions.firstName || ' ' || transactions.lastName
            )
          )
          ORDER BY transactions.startedAt DESC
        )
        FROM 
        (
          SELECT
          ${transactions.startedAt} AS startedAt,
          ${transactions.endedAt} AS endedAt,
          ${transactions.status} AS status,
          ${messages.detail} AS detail,
          ${users.phone} AS phone,
          ${users.firstName} AS firstName,
          ${users.lastName} AS lastName
          FROM ${transactions}
          LEFT JOIN ${messages} ON ${messages.transactionID} = ${transactions.id}
          LEFT JOIN ${users} ON ${users.id} = ${transactions.reserverID}
          WHERE ${transactions.assetID} = ${assets.id} AND ${transactions.status} = 'APPROVE'
          ORDER BY ${transactions.startedAt} DESC
          LIMIT 10
        ) 
        AS transactions
        ),
          '[]'::jsonb
        )
      )
    )`,
      })
      .from(items)
      .leftJoin(assetsToItems, eq(assetsToItems.itemID, items.id))
      .leftJoin(assets, eq(assets.id, assetsToItems.assetID))
      .leftJoin(categories, eq(items.categoryID, categories.id))
      .where(eq(items.id, itemID))
      .groupBy(items.name, items.description, categories.name, items.imageUrl);
    return result;
  },

  getAllTransactionsByUser: async (db, userID, page) => {
    const isExist = await db.query.users.findFirst({
      where: eq(users.id, userID),
    });
    if (!isExist) {
      throw new AppErr(HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
    }
    const result = await db
      .select({
        startTime: sql<Date>`${transactions.startedAt}::date`,
        userTransactions: sql<UserTransactions[]>`jsonb_agg(
        json_build_object(
          'itemName', ${items.name},
          'assetID', ${assets.assetID},
          'startedAt', ${transactions.startedAt},
          'endedAt', ${transactions.endedAt},
          'status', ${transactions.status}
        ) ORDER BY ${transactions.startedAt} DESC
      )`,
      })
      .from(transactions)
      .leftJoin(assets, eq(assets.id, transactions.assetID))
      .leftJoin(items, eq(items.id, transactions.itemID))
      .leftJoin(messages, eq(transactions.id, messages.transactionID))
      .where(eq(transactions.reserverID, userID))
      .groupBy(sql<Date>`${transactions.startedAt}::date`)
      .orderBy(desc(sql`${transactions.startedAt}::date`))
      .limit(10)
      .offset((page - 1) * 10);

    return result;
  },

  getAllTransactionsByDate: async (db, date, page) => {
    // +7 hrs
    const startOfDay = new Date(date);
    startOfDay.setHours(15, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(24, 0, 0, 0);

    const result = await db
      .select({
        user: {
          phone: users.phone,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        },
        adminTransactions: sql<AdminTransactions[]>`jsonb_agg(
        json_build_object(
          'itemName', ${items.name},
          'assetID', ${assets.assetID},
          'startedAt', ${transactions.startedAt},
          'endedAt', ${transactions.endedAt},
          'status', ${transactions.status}
        ) ORDER BY ${transactions.startedAt} DESC
      )`,
      })
      .from(transactions)
      .leftJoin(assets, eq(assets.id, transactions.assetID))
      .leftJoin(items, eq(items.id, transactions.itemID))
      .leftJoin(users, eq(users.id, transactions.reserverID))
      .where(
        and(
          gt(transactions.startedAt, startOfDay),
          lt(transactions.endedAt, endOfDay),
          eq(transactions.status, "APPROVE"),
        ),
      )
      .groupBy(users.phone, users.firstName, users.lastName)
      .orderBy(max(transactions.startedAt))
      .limit(10)
      .offset((page - 1) * 10);

    return result;
  },

  createTransaction: async (db, transaction) => {
    try {
      const checkTimeInterval = await db.query.transactions.findFirst({
        with: {
          assetId: true,
        },
        where: and(
          eq(transactions.assetID, transaction.assetID),
          eq(transactions.itemID, transaction.itemID),
          eq(transactions.status, "APPROVE"),
          lt(transactions.startedAt, transaction.endedAt),
          gt(transactions.endedAt, transaction.startedAt),
        ),
      });
      if (checkTimeInterval) {
        throw new AppErr(HttpStatus.CONFLICT, "TIME_INTERVAL_NOT_VALID");
      }
      const result = await db
        .insert(transactions)
        .values(transaction)
        .returning();
      return result[0];
    } catch (err) {
      console.log(err);
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError
      ) {
        if (
          err.cause.code === "23503" &&
          err.cause.message.includes("reserver_id")
        ) {
          throw new AppErr(HttpStatus.NOT_FOUND, "RESERVER_NOT_FOUND");
        }

        if (
          err.cause.code === "23503" &&
          err.cause.message.includes("asset_id")
        ) {
          throw new AppErr(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND");
        }

        if (err.cause.code === "22P02") {
          throw new AppErr(HttpStatus.BAD_REQUEST, "UUID_INVALID");
        }
      }
      throw err;
    }
  },

  createMessage: async (db, message) => {
    try {
      await db.insert(messages).values(message).returning();
    } catch (err) {
      throw err;
    }
  },
});

export default makeTransactionRepository;
