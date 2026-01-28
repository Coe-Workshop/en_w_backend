import { DBTransaction } from "@/config/drizzle";
import { NewMessage, NewTransaction, Transaction } from "../models";
import { CreateTransactionRequest } from "@/internal/validator/transaction.schema";

export interface TransactionService {
  // getAllItems: () => Promise<Item[]>;
  // getItemByID: (id: number) => Promise<Item | null>;
  createTransaction: (req: CreateTransactionRequest) => Promise<Transaction>;
  // deleteItemByID: (id: number) => Promise<void>;
  // updateItem: (id: number, req: UpdateItemRequest) => Promise<Item>;
}

export interface TransactionRepository {
  createTransaction: (
    db: DBTransaction,
    transaction: NewTransaction,
  ) => Promise<Transaction>;
  getIdOfAsset: (db: DBTransaction, assetID: string) => Promise<number>;
  createMessage: (db: DBTransaction, message: NewMessage) => Promise<void>;
  // getAllItems: (db: DBTransaction) => Promise<Item[]>;
  // getItem: (
  //   db: DBTransaction,
  //   column: string,
  //   value: any,
  // ) => Promise<Item | null>;
  // getCategory: (
  //   db: DBTransaction,
  //   column: string,
  //   value: any,
  // ) => Promise<Category>;
  // deleteItemByID: (db: DBTransaction, id: number) => Promise<void>;
  // updateItem: (
  //   db: DBTransaction,
  //   id: number,
  //   updates: Partial<NewItem>,
  // ) => Promise<Item>;
}
