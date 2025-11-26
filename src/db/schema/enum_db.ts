import { pgEnum } from "drizzle-orm/pg-core";

// not sure
export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "approved",
  "rejected",
  "loaned",
  "returned",
]);

export const userRole = pgEnum("user_role", ["user", "admin"]);

// not sure
export const itemCategory = pgEnum("item_category", [
  "machine",
  "measurement",
  "electronic",
  "other",
]);
