import { Router } from "express";
import { createAsset } from "../controllers/assetController";
const router = Router();

router.post("/", createAsset);

export default router;
