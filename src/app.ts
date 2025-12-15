import dotenv from "dotenv";
import makeServer from "./internal/server";

dotenv.config();

try {
  const server = makeServer();
  server.run();
} catch (err) {
  console.log("err while create server\n", err);
}
