import { ItemCategory } from "../models/items";
import { DB } from "../types/db";
import { ItemRepository } from "./repository";
import { CreateItemRequest } from "./validator";

export const itemService = (db: DB, itemRepository: ItemRepository) => {
  const getAllItems = async () => {
    const items = db.transaction(async (tx) => {
      return await itemRepository.getAllItems(tx);
    });
    return items;
  };

  const getItemByID = async (id: number) => {
    const item = db.transaction(async (tx) => {
      return await itemRepository.getItemByID(tx, id);
    });
    return item;
  };

  const createItem = async (req: CreateItemRequest) => {
    const categoryName = req.category_name as ItemCategory;
    const item = db.transaction(async (tx) => {
      const categoryID = (
        await itemRepository.getCategoryByName(tx, categoryName)
      ).categoryID;
      console.log(categoryID);

      const item = {
        ...req,
        category_id: categoryID,
        description: req.description ?? null,
      };

      return await itemRepository.createItem(tx, item);
    });
    return item;
  };

  const getCategoryByName = async (name: ItemCategory) => {
    const category = db.transaction(async (tx) => {
      return itemRepository.getCategoryByName(tx, name);
    });
    return category;
  };

  return {
    getAllItems,
    getItemByID,
    createItem,
    getCategoryByName,
  };
};

export type ItemService = ReturnType<typeof itemService>;
