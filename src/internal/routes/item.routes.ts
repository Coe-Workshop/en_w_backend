import { Router } from "express";
import { db } from "@/config/drizzle";
import { itemRepository } from "@/pkg/item/repository";
import { itemService } from "@/pkg/item/service";
import itemHandler from "@/pkg/item/handler";

const makeItemRouter = () => {
  const router = Router();

  const repository = itemRepository();
  const service = itemService(db, repository);
  const handler = itemHandler(service);

  router.get("/", handler.getAllItems);
  router.get("/:id", handler.getItemByID);
  router.post("/", handler.createItem);
  router.delete("/:id", handler.deleteItemByID);
  return router;
};

export default makeItemRouter;
