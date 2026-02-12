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
import makeMiddleware from "../middleware/auth";
import makeAssetService from "@/pkg/asset/service";
import { makeAssetRepository } from "@/pkg/asset/repository";
import { makeAssetHandler } from "@/pkg/asset/handler";
import makeTransactionRepository from "@/pkg/transaction/repository";
import makeTransactionService from "@/pkg/transaction/service";
import { makeTransactionHandler } from "@/pkg/transaction/handler";

const setupRoutes = (app: Express, db: DB) => {
  const userRepository = makeUserRepository();
  const itemRepository = makeItemRepository();
  const assetRepository = makeAssetRepository();
  const transactionRepository = makeTransactionRepository();
  const middleware = makeMiddleware();
  const authService = makeAuthService(db, userRepository);
  const itemService = makeItemService(db, itemRepository);
  const assetService = makeAssetService(db, assetRepository);
  const transactionService = makeTransactionService(db, transactionRepository);
  const authHandler = makeAuthHandler(authService);
  const itemHandler = makeItemHandler(itemService, middleware);
  const assetHandler = makeAssetHandler(assetService, middleware);
  const transactionHandler = makeTransactionHandler(transactionService, middleware);
  app.use("/api/v1/auth", authHandler);
  app.use("/api/v1/items", itemHandler);
  app.use("/api/v1/assets", assetHandler);
  app.use("/api/v1/transactions", transactionHandler);

  const userService = makeUserService(db, userRepository);
  const userHandler = makeUserHandler(userService);
  app.use("/api/v1/user", userHandler);
};

export default setupRoutes;
