import { Router } from "express";
import { deleteItem, getItems } from "../controllers/itemsController";
import itemHandler from "../item/handler";
import { itemService } from "../item/service";
import db from "../db";
import { itemRepository } from "../item/repository";
const router = Router();

console.log("case: -1");
// need to pass db from server.js
const repository = itemRepository();
const service = itemService(db, repository);
const handler = itemHandler(service);

router.get("/", handler.getAllItems);
router.post("/", handler.createItem);
router.delete("/:id", deleteItem);

export default router;
