import { and, asc, desc, eq, gt, ilike, inArray, lt, ne, sql } from "drizzle-orm";
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
  transactionStatus,
  users,
  UserTransactions,
} from "../models";
import { AppErr } from "@/utils/appErr";
import { TransactionRepository } from "../domain/transaction";

export const makeTransactionRepository = (): TransactionRepository => ({
  checkTransactionConflict: async (db, reqData) => {
    const details = [];
    let count = 0;
    for (const transactionId of reqData.transactionId) {
      const target = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

      if (target.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "TRANSACTION_NOT_FOUND");
      }

      const conflicts = await db
        .select({
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          itemName: items.name,
          assetId: assets.assetID,
          startedAt: transactions.startedAt,
          endedAt: transactions.endedAt,
        })
        .from(transactions)
        .leftJoin(assets, eq(assets.id, transactions.assetID))
        .leftJoin(items, eq(items.id, transactions.itemID))
        .leftJoin(users, eq(users.id, transactions.reserverID))
        .where(
          and(
            ne(transactions.id, target[0].id),
            eq(transactions.assetID, target[0].assetID),
            eq(transactions.itemID, target[0].itemID),
            eq(transactions.status, "RESERVE"),
            lt(transactions.startedAt, target[0].endedAt),
            gt(transactions.endedAt, target[0].startedAt),
          ),
        )
        .orderBy(asc(sql`${transactions.startedAt}::date`));

      count += conflicts.length;
      details.push({
        transactionId: target[0].id,
        isConflict: conflicts.length > 0,
        conflicts: conflicts,
      });
    }

    const report = {
      totalConflicts: count,
      details: details,
    };

    return report;
  },

  getApprovedBookingsByItem: async (db, reqData) => {
    const isExist = await db.query.items.findFirst({
      where: eq(items.id, reqData.itemId),
    });
    if (!isExist) {
      throw new AppErr(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND");
    }

    // +7 hrs
    const startOfDay = new Date(reqData.date);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(reqData.date);
    endOfDay.setHours(17, 0, 0, 0);

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
              'userName', transactions.firstName || ' ' || transactions.lastName,
	      // replace this with reserver's google profile picture.
              'profileUrl', 'https://gear.kku.ac.th/wp-content/uploads/2025/05/wasu.jpg'
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
          AND ${transactions.startedAt} > ${startOfDay}
          AND ${transactions.endedAt} < ${endOfDay}
          AND ${messages.userID} = ${transactions.reserverID}
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
      .where(eq(items.id, reqData.itemId))
      .groupBy(items.name, items.description, categories.name, items.imageUrl);
    return result;
  },

  updateAllTransactionByUser: async (db, transactionsRequest) => {
    const newStatus = transactionsRequest.isApproved ? "APPROVE" : "REJECT";
    const completeData = {
      status: newStatus as transactionStatus,
      approverID: transactionsRequest.approverID,
    };
    const report = [];
    try {
      const result = await db
        .update(transactions)
        .set(completeData)
        .where(
          and(
            eq(transactions.reserverID, transactionsRequest.reserverID),
            eq(transactions.status, "RESERVE"),
          ),
        )
        .returning({
          id: transactions.id,
        });

      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "RESERVER_NOT_FOUND");
      }
      report.push(result);

      const temp = [];
      if (newStatus === "APPROVE") {
        for (const data of result) {
          const target = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, data.id));
          const conflicts = await db
            .update(transactions)
            .set({
              status: "REJECT",
              approverID: transactionsRequest.approverID,
            })
            .where(
              and(
                ne(transactions.id, data.id),
                eq(transactions.assetID, target[0].assetID),
                eq(transactions.itemID, target[0].itemID),
                eq(transactions.status, "RESERVE"),
                lt(transactions.startedAt, target[0].endedAt),
                gt(transactions.endedAt, target[0].startedAt),
              ),
            )
            .returning({ id: transactions.id });
          if (conflicts.length > 0) {
            const conflictData = conflicts.map((data) => {
              return { id: data.id };
            });
            temp.push(...conflictData);
          }
        }
      }
      report.push(temp);
      return report;
    } catch (err) {
      throw err;
    }
  },

  cancelTransaction: async (db, transactionData) => {
    try {
      const result = await db
        .update(transactions)
        .set({
          status: "REJECT" as transactionStatus,
        })
        .where(
          and(
            eq(transactions.id, transactionData.id),
            eq(transactions.reserverID, transactionData.reserverID),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "TRANSACTION_NOT_FOUND");
      }
    } catch (err) {
      throw err;
    }
  },

  getAllTransactionsByUser: async (db, filters, page) => {
    const { user, userName } = filters;

    let targetUserId: string;

    if (user) {
      targetUserId = user;
    } else if (userName) {
      const matchedUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(
          sql`(${users.firstName} || ' ' || ${users.lastName}) ILIKE ${'%' + userName + '%'}`
        )
        .limit(1);

      if (matchedUsers.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
      }
      targetUserId = matchedUsers[0].id;
    } else {
      throw new AppErr(HttpStatus.BAD_REQUEST, "ต้องระบุ user หรือ userName");
    }

    const userQuery = await db
      .select({
        phone: users.phone,
        userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        faculty: users.faculty,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (userQuery.length === 0) {
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
          'status', ${transactions.status},
          'message', ${messages.detail}
        ) ORDER BY ${transactions.startedAt} DESC
      )`,
      })
      .from(transactions)
      .leftJoin(assets, eq(assets.id, transactions.assetID))
      .leftJoin(items, eq(items.id, transactions.itemID))
      .leftJoin(messages, eq(transactions.id, messages.transactionID))
      .where(eq(transactions.reserverID, targetUserId))
      .groupBy(sql<Date>`${transactions.startedAt}::date`)
      .orderBy(desc(sql`${transactions.startedAt}::date`))
      .limit(10)
      .offset((page - 1) * 10);

    return {
      user: userQuery[0],
      transactions: result,
    };
  },

  getAllTransactionsByStatus: async (db, filters, page) => {
    const { status, date, userName } = filters;

    const conditions = [];
    if (status) conditions.push(eq(transactions.status, status));
    if (date) conditions.push(sql`DATE(${transactions.startedAt}) = ${date}`);

    let matchingUserIds: string[] | undefined;
    if (userName) {
      const matchedUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(
          sql`(${users.firstName} || ' ' || ${users.lastName}) ILIKE ${'%' + userName + '%'}`
        );
      matchingUserIds = matchedUsers.map((u) => u.id);
      if (matchingUserIds.length === 0) {
        return { numberOfPage: 0, users: [] };
      }
    }

    if (matchingUserIds) {
      conditions.push(inArray(transactions.reserverID, matchingUserIds));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalUsers = await db
      .select({ count: sql<number>`count(distinct ${transactions.reserverID})` })
      .from(transactions)
      .where(whereCondition);

    const numberOfPage = Math.ceil(totalUsers[0].count / 15);

    const userIds = await db
      .selectDistinct({
        reserverID: transactions.reserverID,
      })
      .from(transactions)
      .where(whereCondition)
      .orderBy(transactions.reserverID)
      .limit(15)
      .offset((page - 1) * 15);

    const result = [];
    for (const { reserverID } of userIds) {
      const userInfo = await db
        .select({
          phone: users.phone,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          profileUrl: sql<string>`'https://gear.kku.ac.th/wp-content/uploads/2025/05/wasu.jpg'`,
        })
        .from(users)
        .where(eq(users.id, reserverID))
        .limit(1);

      if (userInfo.length === 0) continue;

      const orderBy = status === "RESERVE"
        ? [asc(transactions.startedAt), asc(transactions.createdAt)]
        : [desc(transactions.createdAt)];

      const userTransactionConditions = [eq(transactions.reserverID, reserverID)];
      if (status) userTransactionConditions.push(eq(transactions.status, status));
      if (date) userTransactionConditions.push(sql`DATE(${transactions.startedAt}) = ${date}`);

      const userTransactions = await db
        .select({
          id: transactions.id,
          itemName: sql<string>`COALESCE(${items.name}, 'Unknown')`,
          assetID: sql<string>`COALESCE(${assets.assetID}, 'N/A')`,
          startedAt: transactions.startedAt,
          endedAt: transactions.endedAt,
          status: transactions.status,
          message: sql<string>`COALESCE((SELECT detail FROM messages WHERE txn_id = ${transactions.id} LIMIT 1), 'ไม่มีข้อความ')`,
        })
        .from(transactions)
        .leftJoin(assets, eq(assets.id, transactions.assetID))
        .leftJoin(items, eq(items.id, transactions.itemID))
        .where(and(...userTransactionConditions))
        .orderBy(...orderBy);

      result.push({
        user: userInfo[0],
        adminTransactions: userTransactions,
      });
    }

    return { numberOfPage, users: result };
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
      await db.insert(messages).values(message);
    } catch (err) {
      throw err;
    }
  },

  updateTransactionById: async (db, transaction) => {
    const newStatus = transaction.isApproved ? "APPROVE" : "REJECT";
    const completeData = {
      ...transaction,
      status: newStatus as transactionStatus,
    };
    try {
      const result = await db
        .update(transactions)
        .set(completeData)
        .where(
          and(
            eq(transactions.id, transaction.transactionId),
            eq(transactions.status, "RESERVE"),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "TRANSACTION_NOT_FOUND");
      }
      if (newStatus === "APPROVE") {
        const conflicts = await db
          .update(transactions)
          .set({
            status: "REJECT",
            approverID: transaction.approverID,
          })
          .where(
            and(
              ne(transactions.id, transaction.transactionId),
              eq(transactions.assetID, result[0].assetID),
              eq(transactions.itemID, result[0].itemID),
              eq(transactions.status, "RESERVE"),
              lt(transactions.startedAt, result[0].endedAt),
              gt(transactions.endedAt, result[0].startedAt),
            ),
          )
          .returning({ id: transactions.id });
        if (conflicts.length > 0) {
          return conflicts.map((data) => {
            return { id: data.id };
          });
        }
      }
      return [];
    } catch (err) {
      throw err;
    }
  },

  autoRejectExpiredTransactions: async (db) => {
    try {
      const now = new Date();

      const expiredTransactions = await db
        .update(transactions)
        .set({
          status: "REJECT",
        })
        .where(
          and(
            eq(transactions.status, "RESERVE"),
            lt(transactions.startedAt, now),
          ),
        )
        .returning({
          id: transactions.id,
          startedAt: transactions.startedAt,
          endedAt: transactions.endedAt,
        });

      return expiredTransactions;
    } catch (err) {
      throw err;
    }
  },
});

export default makeTransactionRepository;
