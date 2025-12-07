import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItems,
} from "../controllers/itemsController";
const router = Router();

router.get("/", getItems);
router.post("/", createItem);
router.delete("/:id", deleteItem);

export default router;
