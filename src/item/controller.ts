import { Request, Response, Router } from "express";
import db from "../db";
import { items } from "../db/schema";
import { CreateItemRequest } from "../zSchemas/item";
import { z } from "zod";
import HttpStatus from "http-status";
import ItemRepository from "./repository";

const itemController = () => {
  const itemRepository = new ItemRepository();

  const getItems = async (_: Request, res: Response): Promise<Response> => {
    try {
      const data = await db.select().from(items);
      return res.status(HttpStatus.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      const svcErr = err as Error;
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: svcErr.message });
    }
  };

  const createItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData: CreateItemRequest = CreateItemRequest.parse(
        req.body,
      );
      // if user send empty string. make it fall to db default
      if (validatedData.description === "") {
        validatedData.description = undefined;
      }

      const data = await db.transaction(async (tx) => {
        const insertItem = await itemRepository.insert(tx, validatedData);
        const itemId = insertItem[0].id;
        const itemWithCategories = validatedData.category_ids.map((id) => ({
          item_id: itemId,
          category_id: id,
        }));
        await itemRepository.createItemCategories(tx, itemWithCategories);
        const ans = await itemRepository.getItemCategoriesAsset(tx, itemId);
        // console.log(ans);
        return ans[0];
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: data,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: err.issues[0].message,
        });
      }
      const svcErr = err as Error;
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: svcErr.message });
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
    createItem,
  };
};

export default itemController;
