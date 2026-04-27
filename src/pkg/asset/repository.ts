import { eq, and, ilike, inArray, sql, isNull } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { assets, assetsToItems, items, transactions } from "../models";
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
      .where(isNull(assets.deletedAt))
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

  hasReserveTransactions: async (db, assetId) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.assetID, assetId),
          eq(transactions.status, "RESERVE")
        )
      );
    return result[0].count > 0;
  },

  deleteAsset: async (db, asset) => {
    const id = asset.id;

    const isAssetExist = await db
      .select({ id: assets.id })
      .from(assets)
      .where(and(eq(assets.id, id), isNull(assets.deletedAt)))
      .limit(1);

    if (isAssetExist.length === 0) {
      throw new AppErr(HttpStatus.NOT_FOUND, "ASSET_NOT_FOUND");
    }

    await db
      .update(assets)
      .set({ deletedAt: new Date() })
      .where(eq(assets.id, id));
  },
});

export default makeAssetRepository;
