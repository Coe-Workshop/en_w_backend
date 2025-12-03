import { Router } from "express";
import { getAllItems } from "../controllers/itemsController";
const router = Router();

router.get("/", getAllItems);
// router.post("/item");

export default router;
