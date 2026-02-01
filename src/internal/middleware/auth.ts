import { GoogleUser, UserRole } from "@/pkg/models";
import { NextFunction, Request, RequestHandler, Response } from "express"

export interface MiddlewareResources {
  requireRoles: (role: UserRole) => RequestHandler;
}

const makeMiddleware = (): MiddlewareResources => ({
  requireRoles: (role: UserRole) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = req.user as GoogleUser;
      console.log(user)
      next();
    }
  }
})

export default makeMiddleware;
