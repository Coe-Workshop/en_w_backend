import { Router } from "express";
import { UserService } from "../domain/user";
import { Request, Response } from "express";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import { z } from "zod";

const makeUserHandler = (userService: UserService) => {
  const router = Router();
  const handler = userHandler(userService);

  router.get("/me", handler.getUserMe);
  router.get("/:id", handler.getUserByID);
  router.delete("/:id", handler.deleteUserByID);
  // router.patch("/", handler.updateUser);
  return router;
};

const userHandler = (userService: UserService) => ({
  getUserMe: async (req: Request, res: Response): Promise<Response> => {
    if (!req.isAuthenticated()) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: req.user,
    });
  },

  getUserByID: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = z.uuid().trim().parse(req.params.id);

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

  // updateUser: async (req: Request, res: Response): Promise<Response> => {
  //   try {
  //     const reqData: Partial<CreateUserRequest> = req.body;
  //
  //     const user = await userService.updateUser(reqData);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       data: user,
  //     });
  //   } catch (err) {
  //     if (err instanceof z.ZodError) {
  //       return res.status(HttpStatus.BAD_REQUEST).json({
  //         success: false,
  //         error: err.issues[0].message,
  //       });
  //     } else if (err instanceof AppErr) {
  //       return res.status(err.code).json({
  //         success: false,
  //         error: err.message,
  //       });
  //     }
  //
  //     const er = err as Error;
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: "ไม่สามารถอัปเดตผู้ใช้ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
  //       error: er.message,
  //     });
  //   }
  // },
});

export default makeUserHandler;
