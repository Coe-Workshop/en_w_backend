import { Request, Response, Router } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import {
  CreateItemRequest,
  GetItemsQueryRequest,
  ItemIdRequest,
  UpdateItemRequest,
} from "@/internal/validator/item.schema";
import { itemCategory, ItemCategory, UserRole, Item } from "../models";
import { ItemService } from "../domain/item";
import { AppErr } from "@/utils/appErr";
import { MiddlewareResources } from "@/internal/middleware/auth";
import { s3Service } from "@/pkg/upload/s3.service";
import { uploadMiddleware } from "@/pkg/upload/upload.middleware";

export const makeItemHandler = (
  itemService: ItemService,
  middleware: MiddlewareResources,
) => {
  const router = Router();
  const handler = itemHandler(itemService);

  router.get("/", handler.getItems);
  router.get("/:id", handler.getItemByID);
  router.post(
    "/",
    middleware.requireRoles(UserRole.ADMIN),
    uploadMiddleware.single("image"),
    handler.createItem,
  );
  router.delete(
    "/:id",
    middleware.requireRoles(UserRole.ADMIN),
    handler.deleteItemByID,
  );
  router.patch(
    "/:id",
    middleware.requireRoles(UserRole.ADMIN),
    uploadMiddleware.single("image"),
    handler.updateItem,
  );
  return router;
};

export const itemHandler = (itemService: ItemService) => ({
  getItems: async (req: Request, res: Response): Promise<Response> => {
    try {
      const filter: GetItemsQueryRequest = GetItemsQueryRequest.parse({
        category:
          req.query.category === "null" || req.query.category === "undefined"
            ? undefined
            : req.query.category,
        search:
          req.query.search === "null" || req.query.search === "undefined"
            ? undefined
            : req.query.search,
      });
      const data = await itemService.getItems(filter);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          numberOfPage: Math.ceil(data.length / 30),
          items: data,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: error.issues[0].message,
        });
      }
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
      console.log("DEBUG - req.body:", req.body);
      console.log("DEBUG - req.file:", req.file);
      console.log("DEBUG - content-type:", req.headers["content-type"]);
      console.log("DEBUG - isAuthenticated:", (req as any).isAuthenticated?.());
      const reqData: CreateItemRequest = CreateItemRequest.parse(req.body);

      const categoryName = reqData.categoryName as ItemCategory;
      if (!itemCategory.enumValues.includes(categoryName)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบหมวดหมู่ที่ระบุ",
        });
      }

      let imageUrl: string | undefined = undefined;

      if (req.file) {
        if (!s3Service.isValidImageType(req.file.mimetype)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: "Invalid file type. Only images are allowed (png, jpg, jpeg, gif, webp)",
          });
        }

        if (!s3Service.isValidFileSize(req.file.size)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: "File size exceeds maximum limit of 5MB",
          });
        }

        console.log("DEBUG - Starting S3 upload...");
        try {
          const key = await s3Service.uploadFile(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
          );
          imageUrl = s3Service.getPublicUrl(key);
          console.log("DEBUG - S3 upload success, URL:", imageUrl);
        } catch (uploadError) {
          console.error("DEBUG - S3 upload failed:", uploadError);
          throw uploadError;
        }
      }

      const itemData = {
        ...reqData,
        imageUrl,
      };

      const item = await itemService.createItem(itemData);
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

      const item = await itemService.getItemByID(id);

      if (item?.imageUrl) {
        try {
          const key = item.imageUrl.split(".amazonaws.com/")[1];
          if (key) {
            await s3Service.deleteFile(key);
          }
        } catch (s3Err) {
          console.error("Failed to delete image from S3:", s3Err);
        }
      }

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

      const current = await itemService.getItemByID(id);
      let updateData = { ...reqData };
      let isChanged = false;

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

      if (req.file) {
        if (!s3Service.isValidImageType(req.file.mimetype)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: "Invalid file type. Only images are allowed (png, jpg, jpeg, gif, webp)",
          });
        }

        if (!s3Service.isValidFileSize(req.file.size)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            error: "File size exceeds maximum limit of 5MB",
          });
        }

        if (current?.imageUrl) {
          try {
            const oldKey = current.imageUrl.split(".amazonaws.com/")[1];
            if (oldKey) {
              await s3Service.deleteFile(oldKey);
            }
          } catch (s3Err) {
            console.error("Failed to delete old image from S3:", s3Err);
          }
        }

        const key = await s3Service.uploadFile(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname
        );
        updateData.imageUrl = s3Service.getPublicUrl(key);
        isChanged = true;
      }

      if (!isChanged) {
        return res.status(HttpStatus.OK).json({
          success: true,
          data: current,
          message: "อุปกรณ์ไม่มีการเปลี่ยนแปลงข้อมูล",
        });
      }

      const updated = await itemService.updateItem(id, updateData);

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
