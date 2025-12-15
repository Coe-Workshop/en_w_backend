import { DBTransaction } from "@/config/drizzle";
import { Category, Item, NewItem } from "../models";
import { CreateItemRequest } from "@/internal/validator/item.schema";

export interface ItemService {
  getAllItems: () => Promise<Item[]>;
  getItemByID: (id: number) => Promise<Item | null>;
  createItem: (req: CreateItemRequest) => Promise<Item>;
  deleteItemByID: (id: number) => Promise<void>;
}

export interface ItemRepository {
  createItem: (db: DBTransaction, item: NewItem) => Promise<Item>;
  getAllItems: (db: DBTransaction) => Promise<Item[]>;
  getItem: (
    db: DBTransaction,
    column: string,
    value: any,
  ) => Promise<Item | null>;
  getCategory: (
    db: DBTransaction,
    column: string,
    value: any,
  ) => Promise<Category>;
  deleteItemByID: (db: DBTransaction, id: number) => Promise<void>;
}
