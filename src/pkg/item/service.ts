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
    const name = req.category_name as ItemCategory;
    return await db.transaction(async (tx) => {
      const category = await itemRepository.getCategory(tx, "name", name);

      const item = {
        ...req,
        categoryID: category.id,
        description: req.description ?? undefined,
      };

      return await itemRepository.createItem(tx, item);
    });
  },

  deleteItemByID: async (id) => {
    await db.transaction(async (tx) => {
      await itemRepository.deleteItemByID(tx, id);
    });
  },

  updateItem: async (id, req) => {
    let categoryID: number | undefined;
    if (req.category_name) {
      const categoryName = req.category_name as ItemCategory;
      await db.transaction(async (tx) => {
        const category = await itemRepository.getCategory(
          tx,
          "name",
          categoryName,
        );
        categoryID = category.id;
      });
    }
    const updates = {
      ...req,
      categoryID,
    };
    return await db.transaction(async (tx) => {
      return await itemRepository.updateItem(tx, id, updates);
    });
  },
});

export default makeItemService;
