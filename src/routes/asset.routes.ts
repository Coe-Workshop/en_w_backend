import { Router } from "express";
import { createAsset, deleteAsset } from "../controllers/assetController";
const router = Router();

router.post("/:id", createAsset);
router.delete("/:assetId", deleteAsset);

export default router;
