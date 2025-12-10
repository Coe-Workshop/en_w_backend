import { eq, sql } from "drizzle-orm";
import { assets, categories, items, itemsToCategories } from "../db/schema";
import { DatabaseTransaction } from "../types/db";
import { CreateItemRequest } from "../zSchemas/item";

export default class ItemRepository {
  // create?
  async insert(db: DatabaseTransaction, validatedData: CreateItemRequest) {
    return await db.insert(items).values(validatedData).returning();
  }

  async getItemCategoriesAsset(db: DatabaseTransaction, itemId: number) {
    return await db
      .select({
        id: items.id,
        asset_id: assets.assets_id,
        name: items.name,
        description: items.description,
        image_url: items.image_url,
        categories: sql`jsonb_agg(categories.name)`,
      })
      .from(items)
      .where(eq(items.id, itemId))
      .leftJoin(itemsToCategories, eq(itemsToCategories.item_id, itemId))
      .leftJoin(categories, eq(categories.id, itemsToCategories.category_id))
      .leftJoin(assets, eq(assets.item_id, itemId))
      .groupBy(items.id, assets.id);
  }
  async createItemCategories(
    db: DatabaseTransaction,
    itemWithCategories: {
      item_id: number;
      category_id: number;
    }[],
  ) {
    return await db.insert(itemsToCategories).values(itemWithCategories);
  }
}
