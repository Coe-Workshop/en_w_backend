import { Request, Response, Router } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import { CreateTransactionRequest } from "@/internal/validator/transaction.schema";
import { TransactionService } from "../domain/transaction";

export const makeTransactionHandler = (
  transactionService: TransactionService,
) => {
  const router = Router();
  const handler = transactionHandler(transactionService);
  router.post("/", handler.createTransaction);
  return router;
};

const transactionHandler = (transactionService: TransactionService) => ({
  createTransaction: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: CreateTransactionRequest = CreateTransactionRequest.parse(
        req.body,
      );
      const transaction = await transactionService.createTransaction(reqData);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: transaction,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }

      if (err instanceof AppErr) {
        if (
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "RECORD_NOT_FOUND"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "ไม่พบเลขครุภัณฑ์ดังกล่าว",
          });
        }

        if (
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "RESERVER_NOT_FOUND"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "ไม่พบผู้จองดังกล่าว",
          });
        }

        if (
          err.code === HttpStatus.CONFLICT &&
          err.message === "TIME_INTERVAL_NOT_VALID"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "อุปกรณ์นี้ไม่ว่างในช่วงเวลาที่คุณเลือก กรุณาเลือกเวลาใหม่",
          });
        }
      }

      const er = err as Error;
      console.log(er);
      console.log(er.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารจองอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },
});
