import { Request, Response } from "express";
import db from "../db";
import { assets, categories, items, itemsToCategories } from "../db/schema";
import { CreateItemRequest, DeleteItemRequest } from "../zSchemas/item";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import HttpStatus from "http-status";

// Damnnnnnnn This might be peak
const getItemCategoriesAsset = async (itemId: number) => {
  const resultWithFormat = await db
    .select({
      id: items.id,
      asset_id: assets.assets_id,
      name: items.name,
      description: items.description,
      image_url: items.image_url,
      categories: sql`jsonb_agg(categories.name)`,
    })
    .from(items)
    .where(eq(items.id, itemId))
    .leftJoin(itemsToCategories, eq(itemsToCategories.item_id, itemId))
    .leftJoin(categories, eq(categories.id, itemsToCategories.category_id))
    .leftJoin(assets, eq(assets.item_id, itemId))
    .groupBy(items.id, assets.id);
  return resultWithFormat;
};

export const createItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData: CreateItemRequest = CreateItemRequest.parse(req.body);
    // if user send empty string. make it fall to db default
    if (validatedData.description === "") {
      validatedData.description = undefined;
    }

    // first insert item in to it table
    const insertItem = await db.insert(items).values(validatedData).returning();

    // get item id
    const itemId = insertItem[0].id;

    /* 
        create item with many category 
        like (item_id, category_id)
    */
    const itemWithCategories = validatedData.category_ids.map((id) => ({
      item_id: itemId,
      category_id: id,
    }));

    // insert into junction table between item and category
    await db.insert(itemsToCategories).values(itemWithCategories);

    const ans = await getItemCategoriesAsset(itemId);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: ans[0],
    });
  } catch (error) {
    /* 
     * using custom zod error message
     on "../zSchemas/item"
     */
    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: error.issues[0].message,
      });
    }
    const err = error as Error;
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    let id = req.params.id;
    const validatedId: DeleteItemRequest = DeleteItemRequest.parse(id);
    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, validatedId));
    if (isExist.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    const ans = await getItemCategoriesAsset(validatedId);

    // item in junction table will be delete too
    await db.delete(items).where(eq(items.id, validatedId)).returning();
    return res.status(HttpStatus.OK).json({
      success: true,
      data: ans[0],
    });
  } catch (error) {
    /* 
     * using custom zod error message
     on "../zSchemas/item"
     */
    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: error.issues[0].message,
      });
    }
    const err = error as Error;
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};
