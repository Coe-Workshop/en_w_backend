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
  createAsset: async (itemID, reqData) => {
    return await db.transaction(async (tx) => {
      const asset = {
        itemID: itemID,
        assetID: reqData.assetID,
      };
      return await assetRepository.createAsset(tx, asset);
    });
  },

  deleteAsset: async (itemID, reqData) => {
    return await db.transaction(async (tx) => {
      const asset = {
        itemID: itemID,
        assetID: reqData.assetID,
      };
      await assetRepository.deleteAsset(tx, asset);
    });
  },
});

export default makeAssetService;
