import { Request, Response } from "express";
import db from "../db";
import { assets, items } from "../db/schema";
import { z } from "zod";
import { CreateAssetRequest, DeleteAssetRequest } from "../zSchemas/asset";
import { eq } from "drizzle-orm";
import HttpStatus from "http-status";
import { ItemIdRequest } from "../zSchemas/item";

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const itemId = req.params.id;
    const requestedItemId: ItemIdRequest = ItemIdRequest.parse(itemId);

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

    const requestData: CreateAssetRequest = CreateAssetRequest.parse(req.body);

    const isThisAssetExist = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.assets_id, requestData.assets_id));
    if (isThisAssetExist.length !== 0) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: "มีเลขครุภัณฑ์นี้อยู่แล้ว",
      });
    }

    const validatedData = {
      assets_id: requestData.assets_id,
      item_id: requestedItemId,
    };

    await db.insert(assets).values(validatedData);

    const responseData = await db
      .select({
        id: items.id,
        name: items.name,
        assets_id: assets.assets_id,
      })
      .from(items)
      .where(eq(items.id, requestedItemId))
      .leftJoin(assets, eq(assets.assets_id, requestData.assets_id));

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: responseData[0],
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

export const deleteAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const requestedAssetsId: DeleteAssetRequest = DeleteAssetRequest.parse(
    req.params.assetId,
  );

  try {
    const isExist = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.assets_id, requestedAssetsId));

    if (isExist.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: "ไม่พบอุปกรณ์ที่มีเลขครุภัณฑ์ที่ระบุ",
      });
    }

    await db.delete(assets).where(eq(assets.assets_id, requestedAssetsId));

    return res.status(HttpStatus.OK).json({
      success: true,
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
