import { eq, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { assets, categories, items } from "../models";
import { ItemRepository } from "../domain/item";
import { AppErr } from "@/utils/appErr";

export const makeItemRepository = (): ItemRepository => ({
  async createItem(db, item) {
    try {
      const result = await db.insert(items).values(item).returning();

      if (!Array.isArray(result)) {
        throw new AppErr(HttpStatus.INTERNAL_SERVER_ERROR, "ERROR_INSERT_DATA");
      }

      return result[0];
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError &&
        err.cause.code === "23505" &&
        err.cause.message.includes("name")
      ) {
        throw new AppErr(HttpStatus.CONFLICT, "ITEM_NAME_ALREADY_EXIST");
      }
      throw err;
    }
  },

  getAllItems: async (db) => {
    const result = await db
      .select({
        id: items.id,
        name: items.name,
        assetsID: sql`jsonb_agg(assets.assets_id)`,
        description: items.description,
        category: categories.name,
        imageUrl: items.imageUrl,
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryID, categories.id))
      .leftJoin(assets, eq(items.id, assets.itemID))
      .groupBy(items.id, categories.name);
    return result;
  },

  getItem: async (db, column, value) => {
    const result = await db
      .select({
        id: items.id,
        name: items.name,
        assets_id: sql`jsonb_agg(assets.assets_id)`,
        description: items.description,
        category: categories.name,
        imageUrl: items.imageUrl,
      })
      .from(items)
      .where(eq(sql.identifier(`items"."${column}`), value))
      .leftJoin(categories, eq(items.categoryID, categories.id))
      .leftJoin(assets, eq(items.id, assets.itemID))
      .groupBy(items.id, categories.name);

    if (result.length === 0) {
      throw new AppErr(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND");
    }

    return result[0];
  },

  getCategory: async (db, column, value) => {
    const result = await db
      .select()
      .from(categories)
      .where(eq(sql.identifier(`categories"."${column}`), value));

    return result[0];
  },

  deleteItemByID: async (db, id) => {
    try {
      const result = await db.delete(items).where(eq(items.id, id)).returning();

      if (result.length === 0) {
        throw new AppErr(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND");
      }
    } catch (err) {
      if (
        err instanceof DrizzleQueryError &&
        err.cause instanceof DatabaseError &&
        err.cause.code === "23503"
      ) {
        throw new AppErr(HttpStatus.CONFLICT, "ITEM_HAS_LINKED_ASSETS");
      }
      throw err;
    }
  },
});

export default makeItemRepository;
