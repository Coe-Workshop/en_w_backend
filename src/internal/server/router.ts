import { DB } from "@/config/drizzle";
import { makeItemHandler } from "@/pkg/item/handler";
import makeItemRepository from "@/pkg/item/repository";
import makeItemService from "@/pkg/item/service";
import makeUserRepository from "@/pkg/user/repository";
import makeUserService from "@/pkg/user/service";
import makeUserHandler  from "@/pkg/user/handler";
import { Express } from "express";

const setupRoutes = (app: Express, db: DB) => {
  const itemRepository = makeItemRepository();
  const itemService = makeItemService(db, itemRepository);
  const itemHandler = makeItemHandler(itemService);
  app.use("/api/v1/items", itemHandler);

  const userRepository = makeUserRepository();
  const userService = makeUserService(db, userRepository);
  const userHandler = makeUserHandler(userService);
  // app.use("/api/v1/auth");
  app.use("/api/v1/user",userHandler);
  // app.use("/api/v1/asset");
};

export default setupRoutes;
