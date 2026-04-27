import { DB } from "@/config/drizzle";
import HttpStatus from "http-status";
import { AssetRepository, AssetService } from "../domain/asset";
import { AppErr } from "@/utils/appErr";

export const makeAssetService = (
  db: DB,
  assetRepository: AssetRepository,
): AssetService => ({
  getAllAssets: async () => {
    return await db.transaction(async (tx) => {
      return await assetRepository.getAllAssets(tx);
    });
  },

  createAsset: async (reqData) => {
    return await db.transaction(async (tx) => {
      return await assetRepository.createAsset(tx, reqData);
    });
  },

  deleteAsset: async (reqData) => {
    return await db.transaction(async (tx) => {
      const hasPendingTransactions = await assetRepository.hasReserveTransactions(tx, reqData.id);
      if (hasPendingTransactions) {
        throw new AppErr(HttpStatus.CONFLICT, "ASSET_HAS_PENDING_TRANSACTIONS");
      }
      await assetRepository.deleteAsset(tx, reqData);
    });
  },
});

export default makeAssetService;
