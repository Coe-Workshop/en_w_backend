import { DB } from "@/config/drizzle";
import {
  TransactionRepository,
  TransactionService,
} from "../domain/transaction";

export const makeTransactionService = (
  db: DB,
  transactionRepository: TransactionRepository,
): TransactionService => ({
  createTransaction: async (req) => {
    return await db.transaction(async (tx) => {
      const idOfAsset = await transactionRepository.getIdOfAsset(
        tx,
        req.assetID,
      );
      const completedReq = { ...req, assetID: idOfAsset };
      const result = await transactionRepository.createTransaction(
        tx,
        completedReq,
      );
      const message = {
        transactionID: result.id,
        userID: req.reserverID,
        detail: req.message,
      };
      await transactionRepository.createMessage(tx, message);
      const finalResult = { ...result, assetID: req.assetID };
      return finalResult;
    });
  },
});

export default makeTransactionService;
