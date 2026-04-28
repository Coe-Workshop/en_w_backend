import { DBTransaction } from "@/config/drizzle";
import { Category, Item, NewItem, ItemCategory } from "../models";
import {
  CreateItemRequest,
  UpdateItemRequest,
} from "@/internal/validator/item.schema";

export interface ItemFilter {
  category?: ItemCategory;
  search?: string;
}

export interface ItemService {
  getItems: (filter?: ItemFilter) => Promise<Item[]>;
  getItemByID: (id: number) => Promise<Item | null>;
  createItem: (req: CreateItemRequest) => Promise<Item>;
  deleteItemByID: (id: number) => Promise<void>;
  updateItem: (id: number, req: UpdateItemRequest) => Promise<Item>;
}

export interface ItemRepository {
  createItem: (db: DBTransaction, item: NewItem) => Promise<Item>;
  getItems: (db: DBTransaction, filter?: ItemFilter) => Promise<Item[]>;
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
  updateItem: (
    db: DBTransaction,
    id: number,
    updates: Partial<NewItem>,
  ) => Promise<Item>;
  hasLinkedAssets: (db: DBTransaction, itemId: number) => Promise<boolean>;
  hasReserveTransactions: (db: DBTransaction, itemId: number) => Promise<boolean>;
}
