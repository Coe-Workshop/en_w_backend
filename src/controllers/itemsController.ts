import { Request, Response } from "express";
import db from "../db";
import { assets, items, itemsToCategories } from "../db/schema";
import { CreateItem, DeleteItem } from "../zSchemas/item";
import { z } from "zod";
import { eq } from "drizzle-orm";

const formatHelper = async (itemId: number) => {
  const withAssetId = await db.query.assets.findFirst({
    where: eq(assets.item_id, itemId),
  });
  const withCategories = await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      categories: {
        columns: {},
        with: {
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  const formatResult = {
    // if exist it will show
    ...withAssetId,
    ...withCategories,
    categories: withCategories?.categories.map((g) => ({
      name: g.category.name,
    })),
  };
  return formatResult;
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

    const resultWithFormat = await formatHelper(itemId);

    return res.status(201).json({
      success: true,
      data: resultWithFormat,
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

    const resultWithFormat = await formatHelper(validatedId);

    // item in junction table will be delete too
    await db.delete(items).where(eq(items.id, validatedId)).returning();
    return res.status(200).json({
      success: true,
      data: resultWithFormat,
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
