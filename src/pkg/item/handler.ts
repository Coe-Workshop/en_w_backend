import { Request, Response, Router } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import {
  CreateItemRequest,
  ItemIdRequest,
  UpdateItemRequest,
} from "@/internal/validator/item.schema";
import { itemCategory, ItemCategory, UserRole, Item } from "../models";
import { ItemService } from "../domain/item";
import { AppErr } from "@/utils/appErr";
import { MiddlewareResources } from "@/internal/middleware/auth";

export const makeItemHandler = (itemService: ItemService, middleware: MiddlewareResources) => {
  const router = Router();
  const handler = itemHandler(itemService);

  router.get("/", middleware.requireRoles(UserRole.ADMIN), handler.getAllItems);
  router.get("/:id", handler.getItemByID);
  router.post("/", middleware.requireRoles(UserRole.ADMIN), handler.createItem);
  router.delete("/:id", middleware.requireRoles(UserRole.ADMIN), handler.deleteItemByID);
  router.patch("/:id", handler.updateItem);
  return router;
};

const itemHandler = (itemService: ItemService) => ({
  getAllItems: async (_: Request, res: Response): Promise<Response> => {
    try {
      const data = await itemService.getAllItems();
      return res.status(HttpStatus.OK).json({
        success: true,
        data: data,
      });
    } catch (error) {
      const err = error as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเข้าถึงข้อมูลอุปกรณ์ทั้งหมดได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: err.message,
      });
    }
  },

  getItemByID: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id: ItemIdRequest = ItemIdRequest.parse(req.params.id);

      const data = await itemService.getItemByID(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: data,
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
        err.code === HttpStatus.NOT_FOUND &&
        err.message === "RECORD_NOT_FOUND"
      ) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบอุปกรณ์ที่ระบุ",
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          "ไม่สามารถเข้าถึงข้อมูลอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  createItem: async (req: Request, res: Response): Promise<Response> => {
    try {
      const reqData: CreateItemRequest = CreateItemRequest.parse(req.body);

      const categoryName = reqData.categoryName as ItemCategory;
      if (!itemCategory.enumValues.includes(categoryName)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบหมวดหมู่ที่ระบุ",
        });
      }

      const item = await itemService.createItem(reqData);
      const data = {
        ...item,
        categoryName: categoryName,
      };

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data,
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
        err.message === "ITEM_NAME_ALREADY_EXIST"
      ) {
        return res.status(err.code).json({
          success: false,
          error: "มีอุปกรณ์ชื่อนี้แล้ว",
        });
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "ไม่สามารสร้างอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  deleteItemByID: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id: ItemIdRequest = ItemIdRequest.parse(req.params.id);

      await itemService.deleteItemByID(id);
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
          err.code === HttpStatus.CONFLICT &&
          err.message === "ITEM_HAS_LINKED_ASSETS"
        ) {
          return res.status(err.code).json({
            success: false,
            error: "โปรดลบเลขครุภัณฑ์ก่อนลบอุปกรณ์",
          });
        }

        if (
          err.code === HttpStatus.NOT_FOUND &&
          err.message === "RECORD_NOT_FOUND"
        ) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบอุปกรณ์ที่ระบุ",
          });
        }
      }

      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        description: "ไม่สามารถลบอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },

  updateItem: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id: ItemIdRequest = ItemIdRequest.parse(req.params.id);
      const reqData: UpdateItemRequest = UpdateItemRequest.parse(req.body);
      if (
        reqData.categoryName &&
        !itemCategory.enumValues.includes(reqData.categoryName as ItemCategory)
      ) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบหมวดหมู่ที่ระบุ",
        });
      }

      let isChanged = false;
      const current = await itemService.getItemByID(id);

      for (let [key, newValue] of Object.entries(reqData)) {
        if (key === "category_name") {
          key = "category";
        }
        const currentValue = current?.[key as keyof Item];

        if (currentValue !== newValue && newValue !== undefined) {
          isChanged = true;
          break;
        }
      }

      if (!isChanged) {
        return res.status(HttpStatus.OK).json({
          success: true,
          data: current,
          message: "อุปกรณ์ไม่มีการเปลี่ยนแปลงข้อมูล",
        });
      }

      const updated = await itemService.updateItem(id, reqData);

      const data = {
        ...updated,
        categoryName: reqData.categoryName ?? current?.categoryName,
        assetIDs: current?.assetIDs,
      };
      return res.status(HttpStatus.OK).json({
        success: true,
        data: data,
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
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: "ไม่พบอุปกรณ์ที่ระบุ",
          });
        }
        if (
          err.code === HttpStatus.CONFLICT &&
          err.message === "ITEM_NAME_ALREADY_EXIST"
        ) {
          return res.status(HttpStatus.CONFLICT).json({
            success: false,
            error: "มีอุปกรณ์ชื่อนี้แล้ว",
          });
        }
      }
      const er = err as Error;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        description: "ไม่สามารถอัพเดทอุปกรณ์ได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: er.message,
      });
    }
  },
});
