import { UserRole } from "@/pkg/models";
import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpStatus from "http-status";
import { TempUser } from "../validator/user.schema";

export interface MiddlewareResources {
  requireRoles: (role: UserRole) => RequestHandler;
  reqAuthHandler: () => RequestHandler;
}

const makeMiddleware = (): MiddlewareResources => ({
  requireRoles: (validRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = TempUser.safeParse(req.user);
      if (!result.success) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: "ไม่มีสิทธิ์เข้าถึงข้อมูล",
          message: result.error,
        });
      }

      if (result.data.role !== validRole) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: "ไม่มีสิทธิ์เข้าถึงข้อมูล",
        });
      }

      res.locals.role = result.data.role;
      res.locals.id = result.data.id;
      next();
    };
  },

  reqAuthHandler: () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = TempUser.safeParse(req.user);
      if (!result.success) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: "คำขอไม่ถูกต้อง",
          message: result.error,
        });
      }
      res.locals.role = result.data.role;
      res.locals.id = result.data.id;
      next();
    };
  },
});

export default makeMiddleware;
