import { DB } from "@/config/drizzle";
import {
  TransactionRepository,
  TransactionService,
} from "../domain/transaction";

export const makeTransactionService = (
  db: DB,
  transactionRepository: TransactionRepository,
): TransactionService => ({
  getAllTransactionsByUser: async (userID, page) => {
    return await db.transaction(async (tx) => {
      return await transactionRepository.getAllTransactionsByUser(
        tx,
        userID,
        page,
      );
    });
  },

  getAllTransactionsByItem: async (itemID) => {
    return await db.transaction(async (tx) => {
      return await transactionRepository.getAllTransactionsByItem(tx, itemID);
    });
  },

  getAllTransactionsByDate: async (req, page) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.getAllTransactionsByDate(
        tx,
        req.date,
        page,
      );
      return result;
    });
  },
  createTransaction: async (req) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.createTransaction(tx, req);
      const message = {
        transactionID: result.id,
        userID: req.reserverID,
        detail: req.message,
      };
      await transactionRepository.createMessage(tx, message);
      const finalResult = { ...result, message: req.message };
      return finalResult;
    });
  },
});

export default makeTransactionService;
