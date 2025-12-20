import e, { Router } from "express";
import { UserService } from "../domain/user";
import router from "@/internal/server/router";
import { Request, Response } from "express";
import { CreateUserRequest } from "@/internal/validator/user.schema";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import { z } from "zod";
import { get } from "http";
import { de } from "zod/v4/locales";


const makeUserHandler = (userService: UserService) => {
  const router = Router();
  const handler = userHandler(userService);

  router.post("/", handler.createUser);
  router.delete("/:id", handler.deleteUserByID);
  router.patch("/", handler.updateUser);
  router.get("/:id", handler.getUserByID);
  return router;
};



const userHandler = (userService: UserService) => ({
  createUser: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: CreateUserRequest = CreateUserRequest.parse(req.body);

      const user = await userService.createUser(reqData);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: user,
      });


    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      }

      if (
        err instanceof AppErr &&
        err.code === HttpStatus.CONFLICT &&
        err.message === "USER_EMAIL_ALREADY_EXIST"
      ) {
        return res.status(err.code).json({
          success: false,
          error: "มีผู้ใช้อีเมลนี้ในระบบแล้ว",
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถสร้างผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  deleteUserByID: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = z.uuid().parse(req.params.id);
      const user = await userService.deleteUserByID(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: user,
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
        message: "ไม่สามารถลบผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  updateUser: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: Partial<CreateUserRequest> = req.body;

      const user = await userService.updateUser(reqData);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: user,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: err.issues[0].message,
        });
      } else if (
        err instanceof AppErr) {
        return res.status(err.code).json({
          success: false,
          error: err.message,
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถอัปเดตผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  getUserByID: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = z.uuid().parse(req.params.id);

      const user = await userService.getUserByID(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: user,
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
        message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },
});

export default makeUserHandler;
