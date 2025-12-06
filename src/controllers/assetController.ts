import { Request, Response } from "express";
import db from "../db";
import { assets, items } from "../db/schema";
import { z } from "zod";
import { CreateAsset } from "../zSchemas/asset";
import { eq } from "drizzle-orm";

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

    const getItem = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });
    const formatResult = {
      ...getItem,
      asset: validatedData.assets_id,
    };

    return res.status(201).json({
      success: true,
      data: formatResult,
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
