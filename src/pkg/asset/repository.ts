import { eq, and, ilike } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { assets, items } from "../models";
import { AppErr } from "@/utils/appErr";
import { AssetRepository } from "../domain/asset";

export const makeAssetRepository = (): AssetRepository => ({
  getAllAssets: async (db) => {
    const result = await db
      .select({
        id: assets.id,
        assetID: assets.assetID,
        item: {
          id: items.id,
          name: items.name,
        },
      })
      .from(assets)
      .leftJoin(items, eq(items.id, assets.itemID))
      .orderBy(assets.id);

    return result;
  },

  createAsset: async (db, asset) => {
    try {
      const isAlreadyExist = await db
        .select()
        .from(assets)
        .where(
          and(
            ilike(assets.assetID, asset.assetID),
            eq(assets.itemID, asset.itemID),
          ),
        );
      if (isAlreadyExist.length > 0) {
        throw new AppErr(HttpStatus.CONFLICT, "ASSET_ALREADY_EXIST");
      }

      const result = await db.insert(assets).values(asset).returning();

      const getItemName = await db
        .select({ name: items.name })
        .from(items)
        .where(eq(items.id, result[0].itemID));
      const data = {
        id: result[0].id,
        assetID: result[0].assetID,
        item: {
          id: result[0].itemID,
          name: getItemName[0].name,
        },
      };
      return data;
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError &&
        err.cause.code === "23503"
      ) {
        throw new AppErr(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND");
      }
      throw err;
    }
  },

  deleteAsset: async (db, asset) => {
    try {
      const itemID = asset.itemID;
      const assetID = asset.assetID;
      const isItemIDExist = await db
        .select()
        .from(items)
        .where(eq(items.id, itemID))
        .limit(1);

      if (isItemIDExist.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND");
      }

      const isAssetIDExist = await db
        .select()
        .from(assets)
        .where(and(eq(assets.itemID, itemID), ilike(assets.assetID, assetID)))
        .limit(1);

      if (isAssetIDExist.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND");
      }

      await db
        .delete(assets)
        .where(and(eq(assets.itemID, itemID), ilike(assets.assetID, assetID)));
    } catch (err) {
      throw err;
    }
  },
});

export default makeAssetRepository;
