import { Request, Response, Router } from "express";
import { AssetService } from "../domain/asset";
import {
  CreateAssetRequest,
  DeleteAssetRequest,
} from "@/internal/validator/asset.schema";
import HttpStatus from "http-status";
import z from "zod";
import { AppErr } from "@/utils/appErr";
import { MiddlewareResources } from "@/internal/middleware/auth";
import { UserRole } from "../models";

export const makeAssetHandler = (assetService: AssetService, middleware: MiddlewareResources) => {
  const router = Router();
  const handler = assetHandler(assetService);

  router.get("/", handler.getAllAssets);
  router.post(
    "/", 
    middleware.requireRoles(UserRole.ADMIN),
    handler.createAsset,
  );
  router.delete(
    "/:id", 
    middleware.requireRoles(UserRole.ADMIN),
    handler.deleteAsset,
  );
  return router;
};

const assetHandler = (assetService: AssetService) => ({
  getAllAssets: async (_: Request, res: Response): Promise<Response> => {
    try {
      const data = await assetService.getAllAssets();
      return res.status(HttpStatus.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      const err = error as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error:
          "ไม่สามารถเข้าถึงเลขครุภัรฑ์ทั้งหมดได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        message: err.message,
      });
    }
  },

  createAsset: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: CreateAssetRequest = CreateAssetRequest.parse(req.body);

      const setOfAssetID = new Set(reqData.assetID);
      if (setOfAssetID.size !== reqData.assetID.length) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: "กรุณาอย่ากรอกเลขครุภัณฑ์ซ้ำกัน",
        });
      }

      const asset = await assetService.createAsset(reqData);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: asset,
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
          err.message === "RECORD_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบอุปกรณ์ที่ระบุ",
          });
        }
        if (
          err.code === HttpStatus.CONFLICT &&
          err.message === "ASSET_ALREADY_EXIST"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "อุปกรณ์ดังกล่าวมีบางเลขครุภัณฑ์ที่ระบุแล้ว",
          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "ไม่สามารถเพิ่มเลขครุภัณฑ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        message: error.message,
      });
    }
  },

  deleteAsset: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: DeleteAssetRequest = DeleteAssetRequest.parse({ id: req.params.id });
      await assetService.deleteAsset(reqData);
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
          err.message === "ASSET_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบเลขครุภัณฑ์ที่ระบุ",
          });
        }
        if (
          err.code === HttpStatus.CONFLICT &&
          err.message === "ASSET_HAS_PENDING_TRANSACTIONS"
        ) {
          return res.status(HttpStatus.CONFLICT).json({
            success: false,
	    error: "ไม่สามารถลบครุภัณฑ์ได้เนื่องจากมีคำขอที่ยังดำเนินการอยู่ จัดการคำขอใช้งานครุภัณฑ์ที่เกี่ยวข้องก่อนแล้วลองใหม่อีกครั้ง",

          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "ไม่สามารถลบเลขครุภัณฑ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        message: error.message,
      });
    }
  },
});
