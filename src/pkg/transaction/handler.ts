import { Request, Response, Router } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import {
  CancelTransactionRequest,
  CheckTransactionConflictRequest,
  CreateTransactionRequest,
  GetAllTransactionsByStatusRequest,
  GetAllTransactionsByUserRequest,
  GetApprovedBookingsByItemRequest,
  GetReservedByItemRequest,
  pageNumberRequest,
  UpdateAllTransactionByUserRequest,
  UpdateTransactionByIdRequest,
} from "@/internal/validator/transaction.schema";
import { TransactionService } from "../domain/transaction";
import { MiddlewareResources } from "@/internal/middleware/auth";
import { UserRole } from "../models";

export const makeTransactionHandler = (
  transactionService: TransactionService,
  middleware: MiddlewareResources,
) => {
  const router = Router();

  const handler = transactionHandler(transactionService);
  router.post("/", middleware.reqAuthHandler(), handler.createTransaction);
  router.patch(
    "/:id",
    middleware.requireRoles(UserRole.ADMIN),
    handler.updateTransactionById,
  );
  router.patch(
    "/reserver/:id",
    middleware.requireRoles(UserRole.ADMIN),
    handler.updateAllTransactionByUser,
  );
  router.patch(
    "/:id/cancel",
    middleware.reqAuthHandler(),
    handler.cancelTransaction,
  );
  router.get(
    "/by-item",
    middleware.requireRoles(UserRole.ADMIN),
    handler.getApprovedBookingsByItem,
  );
  router.get(
    "/reserved-by-item",
    middleware.reqAuthHandler(),
    handler.getReservedByItem,
  );
  router.get(
    "/by-user",
    middleware.requireRoles(UserRole.ADMIN),
    handler.getAllTransactionsByUser,
  );
  router.get(
    "/history/me",
    middleware.reqAuthHandler(),
    handler.getTransactionsMe,
  )
  router.get(
    "/by-status",
    middleware.requireRoles(UserRole.ADMIN),
    handler.getAllTransactionsByStatus,
  );
  router.post(
    "/check-conflicts",
    middleware.requireRoles(UserRole.ADMIN),
    handler.checkTransactionConflict,
  );
  return router;
};

const transactionHandler = (transactionService: TransactionService) => ({
  getAllTransactionsByUser: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetAllTransactionsByUserRequest =
        GetAllTransactionsByUserRequest.parse({
          user: req.query.user as string | undefined,
          userName: req.query.userName as string | undefined,
        });
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
          "ไม่สามารถเข้าถึงข้อมูลการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  getTransactionsMe: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetAllTransactionsByUserRequest =
        GetAllTransactionsByUserRequest.parse({
          user: res.locals.id,
        });
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
          "ไม่สามารถเข้าถึงข้อมูลการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  getApprovedBookingsByItem: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const rawData = {
        itemId: req.query.item,
        date: req.query.date,
      };
      const reqData: GetApprovedBookingsByItemRequest =
        GetApprovedBookingsByItemRequest.parse(rawData);
      const result =
        await transactionService.getApprovedBookingsByItem(reqData);
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
          "ไม่สามารถเข้าถึงข้อมูลการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },

  getReservedByItem: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const rawData = {
        itemId: req.query.item,
        date: req.query.date,
      };
      const reqData: GetReservedByItemRequest =
        GetReservedByItemRequest.parse(rawData);
      const result = await transactionService.getReservedByItem(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
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
          "ไม่สามารถเข้าถึงข้อมูลการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },

  getAllTransactionsByStatus: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const reqData: GetAllTransactionsByStatusRequest =
        GetAllTransactionsByStatusRequest.parse({
          status: req.query.status as string | undefined,
          date: req.query.date as string | undefined,
          userName: req.query.userName as string | undefined,
        });
      const page: pageNumberRequest = pageNumberRequest.parse(req.query.page);
      const result = await transactionService.getAllTransactionsByStatus(
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
      const reqData = {
        ...req.body,
        reserverID: res.locals.id,
      };
      const completedData: CreateTransactionRequest =
        CreateTransactionRequest.parse(reqData);
      const transaction =
        await transactionService.createTransaction(completedData);

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

  updateTransactionById: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const rawData = {
        ...req.body,
        transactionId: req.params.id,
        approverID: res.locals.id,
      };
      const reqData: UpdateTransactionByIdRequest =
        UpdateTransactionByIdRequest.parse(rawData);
      await transactionService.updateTransactionById(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
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
          err.message === "TRANSACTION_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบข้อมูลการจองดังกล่าว หรือถูกดำเนินการไปแล้ว",
          });
        }
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเปลี่ยนสถานะการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  updateAllTransactionByUser: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const rawData = {
        ...req.body,
        reserverID: req.params.id,
        approverID: res.locals.id,
      };
      const reqData: UpdateAllTransactionByUserRequest =
        UpdateAllTransactionByUserRequest.parse(rawData);
      await transactionService.updateAllTransactionByUser(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
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
          err.message === "RESERVER_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบผู้จองดังกล่าว หรือทุกรายการจองถูกดำเนินการไปแล้ว",
          });
        }
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเปลี่ยนสถานะการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  cancelTransaction: async (req: Request, res: Response): Promise<Response> => {
    try {
      const rawData = {
        id: req.params.id,
        reserverID: res.locals.id,
      };
      const reqData: CancelTransactionRequest =
        CancelTransactionRequest.parse(rawData);
      await transactionService.cancelTransaction(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
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
          err.message === "TRANSACTION_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบข้อมูลการจองดังกล่าวของคุณ",
          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถยกเลิกการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },

  checkTransactionConflict: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const cleanData = {
        transactionId: [...new Set(req.body.transactionId)],
      };
      const reqData: CheckTransactionConflictRequest =
        CheckTransactionConflictRequest.parse(cleanData);
      const result = await transactionService.checkTransactionConflict(reqData);
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
          err.message === "TRANSACTION_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบข้อมูลการจองบางรายการของผู้จองดังกล่าว",
          });
        }
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถตรวจสอบการจองได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },
});
