import { Router } from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
} from "../controllers/itemsController";
const router = Router();

router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.delete("/:id", deleteItem);

export default router;
