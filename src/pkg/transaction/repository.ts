import { and, eq, gt, lt, ne } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { assets, messages, transactions } from "../models";
import { AppErr } from "@/utils/appErr";
import { TransactionRepository } from "../domain/transaction";

export const makeTransactionRepository = (): TransactionRepository => ({
  createTransaction: async (db, transaction) => {
    try {
      const checkTimeInterval = await db.query.transactions.findFirst({
        with: {
          assetId: true,
        },
        where: and(
          eq(transactions.assetID, transaction.assetID),
          ne(transactions.status, "REJECT"),
          lt(transactions.startedAt, transaction.endedAt),
          gt(transactions.endedAt, transaction.startedAt),
        ),
      });
      if (checkTimeInterval) {
        throw new AppErr(HttpStatus.CONFLICT, "TIME_INTERVAL_NOT_VALID");
      }
      console.log(checkTimeInterval);
      const result = await db
        .insert(transactions)
        .values(transaction)
        .returning({
          id: transactions.id,
          createdAt: transactions.createdAt,
          reserverID: transactions.reserverID,
          approverID: transactions.approverID,
          status: transactions.status,
          startedAt: transactions.startedAt,
          endedAt: transactions.endedAt,
        });
      return result[0];
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError &&
        err.cause.code === "23503" &&
        err.cause.message.includes("reserver_id")
      ) {
        throw new AppErr(HttpStatus.NOT_FOUND, "RESERVER_NOT_FOUND");
      }
      throw err;
    }
  },

  getIdOfAsset: async (db, assetID) => {
    try {
      const result = await db
        .select({ id: assets.id })
        .from(assets)
        .where(eq(assets.assetID, assetID));
      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND");
      }
      return result[0].id;
    } catch (err) {
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
