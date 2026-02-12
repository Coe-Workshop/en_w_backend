import { Request, Response, Router } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import {
  CreateTransactionRequest,
  GetAllTransactionsByDateRequest,
  GetAllTransactionsByUserRequest,
  GetTransactionByItemIdRequest,
  pageNumberRequest,
} from "@/internal/validator/transaction.schema";
import { TransactionService } from "../domain/transaction";
import { MiddlewareResources } from "@/internal/middleware/auth";

export const makeTransactionHandler = (
  transactionService: TransactionService,
  middleware: MiddlewareResources
) => {
  const router = Router();

  const handler = transactionHandler(transactionService);
  router.post("/", handler.createTransaction);
  router.get("/", (req: Request, res: Response) => {
    const { date, item, user } = req.query;
    if (date) {
      return handler.getAllTransactionsByDate(req, res);
    }
    if (item) {
      return handler.getAllTransactionsByItem(req, res);
    }
    if (user) {
      return handler.getAllTransactionsByUser(req, res);
    }
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: "ไม่พบ filter ที่คุณระบุ",
    });
  });
  return router;
};

const transactionHandler = (transactionService: TransactionService) => ({
  getAllTransactionsByUser: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetAllTransactionsByUserRequest =
        GetAllTransactionsByUserRequest.parse(req.query.user);
      const page: pageNumberRequest = pageNumberRequest.parse(req.query.page);
      const result = await transactionService.getAllTransactionsByUser(
        reqData,
        page,
      );
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
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
          err.message === "USER_NOT_FOUND"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "ไม่พบผู้ใช้ที่ระบุ",
          });
        }
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเข้าถึงรายการการจองของผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  getAllTransactionsByItem: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetTransactionByItemIdRequest =
        GetTransactionByItemIdRequest.parse(req.query.item);
      const result = await transactionService.getAllTransactionsByItem(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result[0],
      });
    } catch (err) {
      const error = err as Error;
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }
      if (err instanceof AppErr) {
        if (
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "ITEM_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบอุปกรณ์ที่ระบุ",
          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเข้าถึงเลขครุภัณฑ์ของอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },

  getAllTransactionsByDate: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetAllTransactionsByDateRequest =
        GetAllTransactionsByDateRequest.parse(req.query.date);
      const page: pageNumberRequest = pageNumberRequest.parse(req.query.page);
      const result = await transactionService.getAllTransactionsByDate(
        reqData,
        page,
      );
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเข้าถึงข้อมูลการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

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
          err.code === HttpStatus.BAD_REQUEST &&
          err.message === "UUID_INVALID"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "รูปแบบของ uuid ไม่ถูกต้อง",
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
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "ASSET_NOT_FOUND"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "ไม่พบเลขครุภัณฑ์ดังกล่าว",
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
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารจองอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },
});
