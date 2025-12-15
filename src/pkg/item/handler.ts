import { Request, Response } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import {
  CreateItemRequest,
  ItemIdRequest,
} from "@/internal/validator/item.schema";
import { AppErr } from "@/internal/utils/appErr";
import { itemCategory, ItemCategory } from "../models";
import { ItemService } from "../domain/item";

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
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
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
      console.log(err);
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

      const categoryName = reqData.category_name as ItemCategory;
      if (!itemCategory.enumValues.includes(categoryName)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบหมวดหมู่ที่ระบุ",
        });
      }

      const item = await itemService.createItem(reqData);
      const data = {
        ...item,
        category_name: categoryName,
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
});

export default itemHandler;
