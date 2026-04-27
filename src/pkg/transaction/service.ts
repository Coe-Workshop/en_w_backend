import { DB } from "@/config/drizzle";
import {
  TransactionRepository,
  TransactionService,
} from "../domain/transaction";

export const makeTransactionService = (
  db: DB,
  transactionRepository: TransactionRepository,
): TransactionService => ({
  getAllTransactionsByUser: async (filters, page) => {
    return await db.transaction(async (tx) => {
      return await transactionRepository.getAllTransactionsByUser(
        tx,
        filters,
        page,
      );
    });
  },

  getApprovedBookingsByItem: async (itemID) => {
    return await db.transaction(async (tx) => {
      return await transactionRepository.getApprovedBookingsByItem(tx, itemID);
    });
  },

  getReservedByItem: async (req) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.getReservedByItem(tx, req);
      return result.map((item) => ({
        ...item,
        assetsToItems: item.assetsToItems?.filter(
          (ait: { asset?: { deletedAt?: Date | null } }) => !ait.asset?.deletedAt
        ),
      }));
    });
  },

  getAllTransactionsByStatus: async (req, page) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.getAllTransactionsByStatus(
        tx,
        req,
        page,
      );
      return result;
    });
  },
  createTransaction: async (req) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.createTransaction(tx, req);
      const message = [
        {
          transactionID: result.id,
          userID: req.reserverID,
          detail: req.message,
        },
      ];
      await transactionRepository.createMessage(tx, message);
      const finalResult = { ...result, message: req.message };
      return finalResult;
    });
  },
  updateTransactionById: async (req) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.updateTransactionById(tx, req);
      const messageData = [];

      if (req.message) {
        messageData.push({
          transactionID: req.transactionId,
          userID: req.approverID,
          detail: req.message,
        });
      }

      if (result.length > 0) {
        const autoRejectMessages = result.map((data) => ({
          transactionID: data.id,
          userID: req.approverID,
          detail:
            "ขออภัย รายการจองของคุณถูกยกเลิก เนื่องจากช่วงเวลาดังกล่าวมีการอนุมัติให้ผู้ใช้งานท่านอื่นแล้ว กรุณาตรวจสอบตารางเวลาและทำรายการใหม่อีกครั้ง",
        }));

        messageData.push(...autoRejectMessages);
      }

      if (messageData.length > 0) {
        await transactionRepository.createMessage(tx, messageData);
      }
    });
  },
  updateAllTransactionByUser: async (req) => {
    return await db.transaction(async (tx) => {
      const result = await transactionRepository.updateAllTransactionByUser(
        tx,
        req,
      );
      const approvedTransaction = result[0];
      const rejectedTransaction = result[1] ?? [];
      const messageData = approvedTransaction.map((data) => ({
        transactionID: data.id,
        userID: req.approverID,
        detail: req.message,
      }));
      messageData.push(
        ...rejectedTransaction.map((data) => ({
          transactionID: data.id,
          userID: req.approverID,
          detail:
            "ขออภัย รายการจองของคุณถูกยกเลิก เนื่องจากช่วงเวลาดังกล่าวมีการอนุมัติให้ผู้ใช้งานท่านอื่นแล้ว กรุณาตรวจสอบตารางเวลาและทำรายการใหม่อีกครั้ง",
        })),
      );
      await transactionRepository.createMessage(tx, messageData);
    });
  },

  cancelTransaction: async (req) => {
    return await db.transaction(async (tx) => {
      await transactionRepository.cancelTransaction(tx, req);
    });
  },

  checkTransactionConflict: async (req) => {
    return await db.transaction(async (tx) => {
      return await transactionRepository.checkTransactionConflict(tx, req);
    });
  },
});

export default makeTransactionService;
