import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema/";

export type DB = NodePgDatabase<typeof schema>;
export type DBTransaction = Parameters<Parameters<DB["transaction"]>[0]>[0];
