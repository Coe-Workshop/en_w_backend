import { Request, Response } from "express";
import db from "../db";
import { assets, categories, items, itemsToCategories } from "../db/schema";
import { z } from "zod";
import { CreateAsset } from "../zSchemas/asset";
import { eq, sql } from "drizzle-orm";

const get_item_categories_asset = async (itemId: number) => {
  const resultWithFormat = await db
    .select({
      item_id: items.id,
      asset_id: assets.assets_id,
      item_name: items.name,
      item_description: items.description,
      item_image_url: items.image_url,
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

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData: CreateAsset = CreateAsset.parse(req.body);

    const itemId = validatedData.item_id;
    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, itemId));
    if (isExist.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    await db.insert(assets).values(validatedData);

    // const getItem = await db.query.items.findFirst({
    //   where: eq(items.id, itemId),
    // });
    // const formatResult = {
    //   ...getItem,
    //   asset: validatedData.assets_id,
    // };
    const ans = await get_item_categories_asset(itemId);

    return res.status(201).json({
      success: true,
      data: ans,
    });
  } catch (error) {
    /*
     * using custom zod error message
     on "../zSchemas/item"
     */
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};
