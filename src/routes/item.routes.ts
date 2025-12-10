import { Router } from "express";
import { deleteItem, getItems } from "../controllers/itemsController";
import itemController from "../item/controller";
const router = Router();

const controller = itemController();

router.get("/", getItems);
router.post("/", controller.createItem);
router.delete("/:id", deleteItem);

export default router;
