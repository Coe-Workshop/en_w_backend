import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

dotenv.config();
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
