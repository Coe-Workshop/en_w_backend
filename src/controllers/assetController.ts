import { Request, Response } from "express";
import db from "../db";
import {
  assets,
  categories,
  itemsTable,
  itemsToCategories,
} from "../db/schema";
import { z } from "zod";
import { CreateAssetRequest } from "../zSchemas/asset";
import { eq, sql } from "drizzle-orm";
import HttpStatus from "http-status";

const getItemCategoriesAsset = async (itemId: number) => {
  const resultWithFormat = await db
    .select({
      item_id: itemsTable.id,
      asset_id: assets.assets_id,
      name: itemsTable.name,
      description: itemsTable.description,
      image_url: itemsTable.image_url,
      categories: sql`jsonb_agg(categories.name)`,
    })
    .from(itemsTable)
    .where(eq(itemsTable.id, itemId))
    .leftJoin(itemsToCategories, eq(itemsToCategories.item_id, itemId))
    .leftJoin(categories, eq(categories.id, itemsToCategories.category_id))
    .leftJoin(assets, eq(assets.item_id, itemId))
    .groupBy(itemsTable.id, assets.id);
  return resultWithFormat;
};

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData: CreateAssetRequest = CreateAssetRequest.parse(
      req.body,
    );

    const itemId = validatedData.item_id;
    const isExist = await db
      .select({ id: itemsTable.id })
      .from(itemsTable)
      .where(eq(itemsTable.id, itemId));
    if (isExist.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    await db.insert(assets).values(validatedData);

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
