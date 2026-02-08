import { DBTransaction } from "@/config/drizzle";
import {
  GetAllTransactionsByDate,
  GetAllTransactionsByItem,
  GetAllTransactionsByUser,
  NewMessage,
  NewTransaction,
  Transaction,
} from "../models";
import {
  CreateTransactionRequest,
  GetAllTransactionsByDateRequest,
  GetAllTransactionsByUserRequest,
} from "@/internal/validator/transaction.schema";

export interface TransactionService {
  createTransaction: (req: CreateTransactionRequest) => Promise<Transaction>;
  getAllTransactionsByUser: (
    req: GetAllTransactionsByUserRequest,
    page: number,
  ) => Promise<GetAllTransactionsByUser[]>;
  getAllTransactionsByItem: (
    id: number,
  ) => Promise<GetAllTransactionsByItem[] | null>;
  getAllTransactionsByDate: (
    req: GetAllTransactionsByDateRequest,
    page: number,
  ) => Promise<GetAllTransactionsByDate[]>;
}

export interface TransactionRepository {
  getAllTransactionsByUser: (
    db: DBTransaction,
    id: string,
    page: number,
  ) => Promise<GetAllTransactionsByUser[]>;
  getAllTransactionsByItem: (
    db: DBTransaction,
    id: number,
  ) => Promise<GetAllTransactionsByItem[] | null>;
  getAllTransactionsByDate: (
    db: DBTransaction,
    date: Date,
    page: number,
  ) => Promise<GetAllTransactionsByDate[]>;
  createTransaction: (
    db: DBTransaction,
    transaction: NewTransaction,
  ) => Promise<Transaction>;
  createMessage: (db: DBTransaction, message: NewMessage) => Promise<void>;
}
