import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../models";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    console.log("Database connected successfully!");
    client.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const db = drizzle(pool, { schema });

export { db, schema };
export type DB = typeof db;
export type DBTransaction = Parameters<Parameters<DB["transaction"]>[0]>[0];
