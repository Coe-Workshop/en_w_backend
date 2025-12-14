import { eq, sql } from "drizzle-orm";
import { DBTransaction } from "../types/db";
import { categories, ItemCategory, items, NewItem } from "../models/items";
import { assets } from "../models/asset";

export const itemRepository = () => {
  console.log("case: -2");
  const createItem = async (db: DBTransaction, item: NewItem) => {
    console.log("case: 6");
    const result = await db.insert(items).values(item).returning();
    console.log("case: 7");

    if (Array.isArray(result)) return result[0];
    return result;
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

  const getItemByID = async (db: DBTransaction, id: number) => {
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
      .where(eq(items.id, id))
      .leftJoin(categories, eq(items.category_id, categories.id))
      .leftJoin(assets, eq(items.id, assets.item_id))
      .groupBy(items.id, categories.name);
    return result;
  };

  const getCategoryByName = async (db: DBTransaction, name: ItemCategory) => {
    const category = await db
      .select({ categoryID: categories.id })
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);
    return category[0];
  };

  return { createItem, getAllItems, getItemByID, getCategoryByName };
};

export type ItemRepository = ReturnType<typeof itemRepository>;
