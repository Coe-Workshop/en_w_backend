import { Request, Response } from "express";
import db from "../db";
import { assets, items } from "../db/schema";
import { z } from "zod";
import { CreateAssetRequest } from "../zSchemas/asset";
import { eq } from "drizzle-orm";
import HttpStatus from "http-status";
import { formatResponseData } from "./itemsController";

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const requestData: CreateAssetRequest = CreateAssetRequest.parse(req.body);

    const itemId = requestData.item_id;
    const isExist = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, itemId));
    if (isExist.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "ไม่พบอุปกรณ์ที่ระบุ",
      });
    }

    await db.insert(assets).values(requestData);

    const responseData = await formatResponseData(itemId);

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

// export const deleteAsset = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(HttpStatus.BAD_REQUEST).json({
//         success: false,
//         error: error.issues[0].message,
//       });
//     }
//     const err = error as Error;
//     return res
//       .status(HttpStatus.INTERNAL_SERVER_ERROR)
//       .json({ success: false, error: err.message });
//   }
// };
