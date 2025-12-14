import { eq, sql } from "drizzle-orm";
import { categories, items, NewItem } from "../models/item";
import { assets } from "../models/asset";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm/errors";
import HttpStatus from "http-status";
import { AppErr } from "../utils/appErr";
import { PgColumn } from "drizzle-orm/pg-core";
import { DBTransaction } from "../config/drizzle";

export const itemRepository = () => {
  const createItem = async (db: DBTransaction, item: NewItem) => {
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
  };

  const getAllItems = async (db: DBTransaction) => {
    const result = await db
      .select({
        id: items.id,
        name: items.name,
        assets_id: sql`jsonb_agg(assets.assets_id)`,
        description: items.description,
        category: categories.name,
        image_url: items.image_url,
      })
      .from(items)
      .leftJoin(categories, eq(items.category_id, categories.id))
      .leftJoin(assets, eq(items.id, assets.item_id))
      .groupBy(items.id, categories.name);
    return result;
  };

  const getItem = async (db: DBTransaction, column: PgColumn, value: any) => {
    const result = await db
      .select({
        id: items.id,
        name: items.name,
        assets_id: sql`jsonb_agg(assets.assets_id)`,
        description: items.description,
        category: categories.name,
        image_url: items.image_url,
      })
      .from(items)
      .where(eq(column, value))
      .leftJoin(categories, eq(items.category_id, categories.id))
      .leftJoin(assets, eq(items.id, assets.item_id))
      .groupBy(items.id, categories.name);
    return result[0];
  };

  const getCategory = async (
    db: DBTransaction,
    column: PgColumn,
    value: any,
  ) => {
    const category = await db
      .select()
      .from(categories)
      .where(eq(column, value))
      .limit(1);

    return category[0];
  };

  const deleteItemByID = async (db: DBTransaction, id: number) => {
    try {
      await db.delete(items).where(eq(items.id, id));
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
  };

  return { createItem, getAllItems, getItem, getCategory, deleteItemByID };
};

export type ItemRepository = ReturnType<typeof itemRepository>;
