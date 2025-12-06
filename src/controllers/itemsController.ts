import { Request, Response } from "express";
import db from "../db";
import { assets, categories, items, itemsToCategories } from "../db/schema";
import { CreateItem, DeleteItem } from "../zSchemas/item";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";

// Damnnnnnnn This might be peak
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

export const createItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData: CreateItem = CreateItem.parse(req.body);
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
    const itemWithCategories = [];
    for (let i = 0; i < validatedData.category_ids.length; i++) {
      itemWithCategories.push({
        item_id: itemId,
        category_id: validatedData.category_ids[i],
      });
    }

    // insert into junction table between item and category
    await db.insert(itemsToCategories).values(itemWithCategories);

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

export const deleteItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    let id = req.params.id;
    const validatedId: DeleteItem = DeleteItem.parse(id);
    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, validatedId));
    if (isExist.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    const ans = await get_item_categories_asset(validatedId);

    // item in junction table will be delete too
    await db.delete(items).where(eq(items.id, validatedId)).returning();
    return res.status(200).json({
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
