import { DB } from "@/config/drizzle";
import { AssetRepository, AssetService } from "../domain/asset";

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
      await assetRepository.deleteAsset(tx, reqData);
    });
  },
});

export default makeAssetService;
