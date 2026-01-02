import { Request, Response, Router } from "express";
import { AssetService } from "../domain/asset";
import { ItemIdRequest } from "@/internal/validator/item.schema";
import {
  CreateAssetRequest,
  DeleteAssetRequest,
} from "@/internal/validator/asset.schema";
import HttpStatus from "http-status";
import z from "zod";
import { AppErr } from "@/utils/appErr";

export const makeAssetHandler = (assetService: AssetService) => {
  const router = Router();
  const handler = assetHandler(assetService);

  router.get("/", handler.getAllAssets);
  router.post("/:id", handler.createAsset);
  router.delete("/:id", handler.deleteAsset);
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
        message:
          "ไม่สามารถเข้าถึงเลขครุภัรฑ์ทั้งหมดได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: err.message,
      });
    }
  },

  createAsset: async (req: Request, res: Response): Promise<Response> => {
    try {
      const itemID: ItemIdRequest = ItemIdRequest.parse(req.params.id);
      const reqData: CreateAssetRequest = CreateAssetRequest.parse(req.body);
      const asset = await assetService.createAsset(itemID, reqData);
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
            error: "อุปกรณ์ดังกล่าวมีเลขครุภัณฑ์ที่ระบุแล้ว",
          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถเพิ่มเลขครุภัณฑ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },

  deleteAsset: async (req: Request, res: Response): Promise<Response> => {
    try {
      const itemID: ItemIdRequest = ItemIdRequest.parse(req.params.id);
      const reqData: DeleteAssetRequest = DeleteAssetRequest.parse(req.body);
      await assetService.deleteAsset(itemID, reqData);
      return res.status(HttpStatus.CREATED).json({
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
          err.message === "ITEM_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบอุปกรณ์ที่ระบุ",
          });
        }
        if (
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "ASSET_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบเลขครุภัณฑ์ที่ระบุ",
          });
        }
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารถลบเลขครุภัณฑ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: error.message,
      });
    }
  },
});
