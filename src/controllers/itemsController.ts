import { Request, Response } from "express";
import db from "../db";
import { items } from "../db/schema";
import { CreateItem, DeleteItem } from "../zSchemas/item";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const createItem = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData: CreateItem = CreateItem.parse(req.body);
    const result = await db.insert(items).values(validatedData).returning();
    return res.status(201).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    // using custom zod error message
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
    const result = await db
      .delete(items)
      .where(eq(items.id, validatedId))
      .returning();
    return res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};
