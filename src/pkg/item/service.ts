import { DB } from "@/config/drizzle";
import { ItemCategory } from "../models";
import { ItemRepository, ItemService } from "../domain/item";

export const makeItemService = (
  db: DB,
  itemRepository: ItemRepository,
): ItemService => ({
  getAllItems: async () => {
    return await db.transaction(async (tx) => {
      return await itemRepository.getAllItems(tx);
    });
  },

  getItemByID: async (id) => {
    const item = await db.transaction(async (tx) => {
      return await itemRepository.getItem(tx, "id", id);
    });
    return item;
  },

  createItem: async (req) => {
    const name = req.categoryName as ItemCategory;
    return await db.transaction(async (tx) => {
      const category = await itemRepository.getCategory(tx, "name", name);

      const item = {
        ...req,
        categoryID: category.id,
        description: req.description ?? null,
      };

      return await itemRepository.createItem(tx, item);
    });
  },

  deleteItemByID: async (id) => {
    await db.transaction(async (tx) => {
      await itemRepository.deleteItemByID(tx, id);
    });
  },
});

export default makeItemService;
