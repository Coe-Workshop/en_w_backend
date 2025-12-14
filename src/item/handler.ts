import { Request, Response } from "express";
import { z } from "zod";
import HttpStatus from "http-status";
import { ItemService } from "./service";
import { ItemCategory, itemCategory } from "../models/items";
import { CreateItemRequest } from "./validator";

const itemHandler = (itemService: ItemService) => {
  const getAllItems = async (_: Request, res: Response): Promise<Response> => {
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
  };

  const createItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("case: 0");
      const reqData: CreateItemRequest = CreateItemRequest.parse(req.body);

      const categoryName = reqData.category_name as ItemCategory;
      if (!itemCategory.enumValues.includes(categoryName)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: "ไม่พบหมวดหมู่ที่ระบุ",
        });
      }

      console.log("case: 1");
      const item = await itemService.createItem(reqData);
      console.log("case: 2");
      const data = {
        ...item,
        category_name: categoryName,
      };

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: error.issues[0].message,
        });
      }
      const err = error as Error;
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  };

  // export const deleteItem = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<Response> => {
  //   try {
  //     db.transaction((tx) => {
  //       let id = req.params.id;
  //       const validatedId: DeleteItemRequest = DeleteItemRequest.parse(id);
  //       const isExist = await db
  //       .select({ id: items.id })
  //       .from(items)
  //       .where(eq(items.id, validatedId));
  //       if (isExist.length === 0) {
  // 	res.status(HttpStatus.NOT_FOUND).json({
  // 	  success: false,
  // 	  message: "ไม่พบอุปกรณ์ที่ระบุ",
  // 	});
  //       }
  //
  //       const ans = await itemRepository.getItemCategoriesAsset(tx, validatedId);
  //
  //       // item in junction table will be delete too
  //     await db.delete(items).where(eq(items.id, validatedId)).returning();
  //     })
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       data: ans[0],
  //     });
  //   } catch (err) {
  //     /*
  //      * using custom zod error message
  //      on "../zSchemas/item"
  //      */
  //     if (err instanceof z.ZodError) {
  //       return res.status(HttpStatus.BAD_REQUEST).json({
  //         error: err.issues[0].message,
  //       });
  //     }
  //     const svcErr = err as Error;
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json({ error: svcErr.message });
  //   }
  // };
  return {
    getAllItems,
    createItem,
  };
};

export default itemHandler;
