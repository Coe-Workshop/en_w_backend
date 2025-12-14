import { eq } from "drizzle-orm";
import { categories, ItemCategory, items } from "../models/item";
import { AppErr } from "../utils/appErr";
import { ItemRepository } from "./repository";
import { CreateItemRequest } from "./validator";
import HttpStatus from "http-status";
import { DB } from "../config/drizzle";

export const itemService = (db: DB, itemRepository: ItemRepository) => {
  const getAllItems = async () => {
    return await db.transaction(async (tx) => {
      return await itemRepository.getAllItems(tx);
    });
  };

  const getItemByID = async (id: number) => {
    const item = await db.transaction(async (tx) => {
      return await itemRepository.getItem(tx, items.id, id);
    });

    if (!item) {
      throw new AppErr(HttpStatus.NOT_FOUND, "ไม่พบอุปกรณ์ที่ระบุ");
    }
  };

  const createItem = async (req: CreateItemRequest) => {
    const name = req.category_name as ItemCategory;
    return await db.transaction(async (tx) => {
      const category = await itemRepository.getCategory(
        tx,
        categories.name,
        name,
      );

      const item = {
        ...req,
        category_id: category.id,
        description: req.description ?? null,
      };

      return await itemRepository.createItem(tx, item);
    });
  };

  const deleteItemByID = async (id: number) => {
    console.log("case: 1");
    // if (isAssetIdExist) {
    //   return res.status(HttpStatus.CONFLICT).json({
    //     success: false,
    //     error: "โปรดลบเลขครุภัณฑ์ก่อนที่จะลบอุปกรณ์",
    //   });
    // }

    await db.transaction(async (tx) => {
      await itemRepository.deleteItemByID(tx, id);
    });
  };

  return {
    getAllItems,
    getItemByID,
    createItem,
    deleteItemByID,
  };
};

export type ItemService = ReturnType<typeof itemService>;
