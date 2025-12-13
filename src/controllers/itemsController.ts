import { Request, Response } from "express";
import db from "../db";
import {
  assets,
  categories,
  itemCategory,
  items,
  itemsToCategories,
} from "../db/schema";
import { CreateItemRequest, DeleteItemRequest } from "../zSchemas/item";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import HttpStatus from "http-status";

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

export const getItems = async (
  _: Request,
  res: Response,
): Promise<Response> => {
  try {
    const data = await db.select().from(items);
    return res.status(HttpStatus.CREATED).json({
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

export const createItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const requestData: CreateItemRequest = CreateItemRequest.parse(req.body);

    type ItemCategory = (typeof itemCategory.enumValues)[number];

    // check that is category exist.
    if (
      !itemCategory.enumValues.includes(
        requestData.category_name as ItemCategory,
      )
    ) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: "ไม่พบหมวดหมู่ที่ระบุ",
      });
    }

    // assign type to variable
    const categoryName = requestData.category_name as ItemCategory;

    const categoryId = await db
      .select({ categoryId: categories.id })
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1);

    const { category_name, ...dataWithoutCategoryName } = requestData;

    const validatedData = {
      name: dataWithoutCategoryName.name,
      category_id: categoryId[0].categoryId,
      description: dataWithoutCategoryName.description,
      image_url: dataWithoutCategoryName.image_url,
    };

    // if user send empty string. make it fall to db default
    if (validatedData.description === "") {
      validatedData.description = undefined;
    }

    const insertItem = await db.insert(items).values(validatedData).returning();

    const responseData = {
      id: insertItem[0].id,
      name: insertItem[0].name,
      description: insertItem[0].description,
      category_name: categoryName,
      image_url: insertItem[0].image_url,
    };

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    /* 
     * using custom zod error message
     on "../zSchemas/item"
     */
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
  } catch (err) {
    /* 
     * using custom zod error message
     on "../zSchemas/item"
     */
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
