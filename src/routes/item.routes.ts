import { Router } from "express";
import { createItem, deleteItem } from "../controllers/itemsController";
const router = Router();

// router.get("/", getAllItems);
router.post("/", createItem);
router.delete("/:id", deleteItem);

export default router;
