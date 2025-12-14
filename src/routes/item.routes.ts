import { Router } from "express";
import itemHandler from "../item/handler";
import { itemService } from "../item/service";
import { itemRepository } from "../item/repository";
import { db } from "../config/drizzle";
const router = Router();

// need to pass db from server.js
const repository = itemRepository();
const service = itemService(db, repository);
const handler = itemHandler(service);

router.get("/", handler.getAllItems);
router.get("/:id", handler.getItemByID);
router.post("/", handler.createItem);
router.delete("/:id", handler.deleteItemByID);

export default router;
