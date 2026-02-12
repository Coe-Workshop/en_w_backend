import { eq, and, ilike, inArray } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { assets, assetsToItems, items } from "../models";
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
      .leftJoin(assetsToItems, eq(assetsToItems.assetID, assets.id))
      .leftJoin(items, eq(items.id, assetsToItems.itemID))
      .orderBy(assets.id);

    return result;
  },

  createAsset: async (db, reqData) => {
    try {
      const isAlreadyExist = await db
        .select()
        .from(assets)
        .leftJoin(assetsToItems, eq(assetsToItems.assetID, assets.id))
        .where(
          and(
            inArray(assets.assetID, reqData.assetID as string[]),
            eq(assetsToItems.itemID, reqData.itemID),
          ),
        );
      if (isAlreadyExist.length > 0) {
        throw new AppErr(HttpStatus.CONFLICT, "ASSET_ALREADY_EXIST");
      }

      const assetsWithKey = reqData.assetID.map((data) => {
        return {
          assetID: data as string,
        };
      });

      const insertAssetId = await db
        .insert(assets)
        .values(assetsWithKey)
        .onConflictDoUpdate({
          target: assets.assetID,
          set: { assetID: assets.assetID },
        })
        .returning({ id: assets.id });

      const arrayOfIdAsset = insertAssetId.map((data) => data.id);

      const junctionData = insertAssetId.map((data) => {
        return {
          assetID: data.id,
          itemID: reqData.itemID,
        };
      });

      await db.insert(assetsToItems).values(junctionData);

      const getItemName = await db
        .select({ name: items.name })
        .from(assetsToItems)
        .leftJoin(items, eq(items.id, assetsToItems.itemID))
        .where(eq(items.id, reqData.itemID));

      const data = {
        id: arrayOfIdAsset,
        assetID: reqData.assetID,
        item: {
          id: reqData.itemID,
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
        .from(assetsToItems)
        .leftJoin(items, eq(items.id, assetsToItems.itemID))
        .where(eq(items.id, assetsToItems.itemID))
        .limit(1);

      if (isItemIDExist.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND");
      }

      const isAssetIDExist = await db
        .select({ id: assets.id })
        .from(assets)
        .leftJoin(assetsToItems, eq(assetsToItems.assetID, assets.id))
        .where(
          and(eq(assetsToItems.itemID, itemID), ilike(assets.assetID, assetID)),
        )
        .limit(1);

      if (isAssetIDExist.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND");
      }

      await db
        .delete(assetsToItems)
        .where(
          and(
            eq(assetsToItems.itemID, itemID),
            eq(assetsToItems.assetID, isAssetIDExist[0].id),
          ),
        );

      const isStillleft = await db
        .select()
        .from(assetsToItems)
        .where(eq(assetsToItems.assetID, isAssetIDExist[0].id))
        .limit(1);
      if (isStillleft.length === 0) {
        await db.delete(assets).where(eq(assets.id, isAssetIDExist[0].id));
      }
    } catch (err) {
      throw err;
    }
  },
});

export default makeAssetRepository;
