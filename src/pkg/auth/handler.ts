import { Request, Response, Router } from "express";
import passport from "passport";
import { GoogleUser } from "../models";
import HttpStatus from "http-status";
import { AppErr } from "@/utils/appErr";
import z from "zod";
import { AuthService } from "../domain/auth";
import { RegisterRequest } from "@/internal/validator/auth.schema";

const makeAuthHandler = (authService: AuthService) => {
  const router = Router();
  const handler = authHandler(authService);

  router.get(
    "/",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  router.get(
    "/callback",
    passport.authenticate("google", {
      failureRedirect: process.env.FRONTEND_URL || "http://localhost:3000",
    }),
    handler.googleCallback,
  );

  router.post("/logout", handler.logout);
  router.post("/register", handler.register);
  return router;
};

const authHandler = (authService: AuthService) => ({
  googleCallback: async (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const user = req.user as GoogleUser;
    const isRegistered = await authService.isRegistered(user.email);
    if (user && !isRegistered) {
      return res.redirect(`${frontendUrl}/register`);
    }

    res.redirect(frontendUrl);
  },

  // TODO: refactor
  logout: (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Logout failed",
        });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: "Session destroy failed",
          });
        }

        res.json({
          success: true,
          message: "Logged out successfully",
        });
      });
    });
  },

  register: async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: "ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาลงชื่อเข้าใช้",
      });
    }

    const reqData: RegisterRequest = RegisterRequest.parse(req.body);

    try {
      const googleUser = req.user as GoogleUser;
      const reqUser = {
        email: googleUser.email,
        ...reqData,
      };
      const user = authService.register(reqUser);

      res.status(HttpStatus.CREATED).json({
        success: true,
        user,
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
});

export default makeAuthHandler;
