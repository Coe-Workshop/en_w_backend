import { DBTransaction } from "@/config/drizzle";
import { AllAsset, Asset, delAsset, NewAsset } from "../models/asset.db";
import {
  CreateAssetRequest,
  DeleteAssetRequest,
} from "@/internal/validator/asset.schema";

export interface AssetService {
  getAllAssets: () => Promise<AllAsset[]>;
  createAsset: (id: number, req: CreateAssetRequest) => Promise<Asset>;
  deleteAsset: (id: number, req: DeleteAssetRequest) => Promise<void>;
}

export interface AssetRepository {
  createAsset: (db: DBTransaction, Asset: NewAsset) => Promise<Asset>;
  getAllAssets: (db: DBTransaction) => Promise<AllAsset[]>;
  deleteAsset: (db: DBTransaction, Asset: delAsset) => Promise<void>;
}
