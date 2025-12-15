import { Express } from "express";
import makeItemRouter from "./item.routes";

export default function routes(app: Express) {
  const itemRouter = makeItemRouter();

  // app.use("/api/v1/auth");
  // app.use("/api/v1/user");
  app.use("/api/v1/items", itemRouter);
  // app.use("/api/v1/asset");
}
