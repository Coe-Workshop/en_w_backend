import { Request, Response } from "express";
import db from "../db";
import { categories, items, itemCategory, assets } from "../db/schema";
import { CreateItemRequest, ItemIdRequest } from "../zSchemas/item";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import HttpStatus from "http-status";

const formatResponseData = async (itemId?: number) => {
  const result = await db
    .select({
      id: items.id,
      name: items.name,
      assets_id: sql`jsonb_agg(assets.assets_id)`,
      description: items.description,
      category: categories.name,
      image_url: items.image_url,
    })
    .from(items)
    .where(itemId ? eq(items.id, itemId) : undefined)
    .leftJoin(categories, eq(items.category_id, categories.id))
    .leftJoin(assets, eq(items.id, assets.item_id))
    .groupBy(items.id, categories.name);
  return result;
};

export const getAllItems = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const responseData = await formatResponseData();
    return res.status(HttpStatus.OK).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    const err = error as Error;
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

export const getItemById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const id = req.params.id;
    const requestedItemId: ItemIdRequest = ItemIdRequest.parse(id);

    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, requestedItemId));

    if (isExist.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }
    const responseData = await formatResponseData(requestedItemId);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: responseData[0],
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
    const id = req.params.id;
    const requestedItemId: ItemIdRequest = ItemIdRequest.parse(id);

    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, requestedItemId));

    if (isExist.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    const isAssetIdExist = await db
      .select()
      .from(assets)
      .where(eq(assets.item_id, requestedItemId));

    if (isAssetIdExist) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: "โปรดลบเลขครุภัณฑ์ก่อนที่จะลบอุปกรณ์",
      });
    }

    await db.delete(items).where(eq(items.id, requestedItemId));
    return res.status(HttpStatus.OK).json({
      success: true,
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

export const updateItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const id = req.params.id;
    const requestedItemId: ItemIdRequest = ItemIdRequest.parse(id);

    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, requestedItemId));

    if (isExist.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    const isAssetIdExist = await db
      .select()
      .from(assets)
      .where(eq(assets.item_id, requestedItemId));

    if (isAssetIdExist) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: "โปรดลบเลขครุภัณฑ์ก่อนที่จะลบอุปกรณ์",
      });
    }

    await db.delete(items).where(eq(items.id, requestedItemId));
    return res.status(HttpStatus.OK).json({
      success: true,
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
