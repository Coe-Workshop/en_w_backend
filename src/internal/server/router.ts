import { DB } from "@/config/drizzle";
import { makeItemHandler } from "@/pkg/item/handler";
import makeItemRepository from "@/pkg/item/repository";
import makeItemService from "@/pkg/item/service";
import makeUserRepository from "@/pkg/user/repository";
import makeUserService from "@/pkg/user/service";
import makeUserHandler from "@/pkg/user/handler";
import { Express } from "express";
import makeAuthHandler from "@/pkg/auth/handler";
import makeAuthService from "@/pkg/auth/service";

const setupRoutes = (app: Express, db: DB) => {
  const userRepository = makeUserRepository();
  const itemRepository = makeItemRepository();
  const authService = makeAuthService(db, userRepository);
  const itemService = makeItemService(db, itemRepository);
  const authHandler = makeAuthHandler(authService);
  const itemHandler = makeItemHandler(itemService);
  app.use("/api/v1/auth", authHandler);
  app.use("/api/v1/items", itemHandler);

  const userService = makeUserService(db, userRepository);
  const userHandler = makeUserHandler(userService);
  app.use("/api/v1/user", userHandler);
  // app.use("/api/v1/asset");
};

export default setupRoutes;
