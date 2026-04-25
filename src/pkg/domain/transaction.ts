import { DBTransaction } from "@/config/drizzle";
import {
  GetAllTransactionsByItem,
  GetAllTransactionsByStatus,
  GetAllTransactionsByUser,
  NewMessage,
  NewTransaction,
  Transaction,
  transactionIdList,
  UpdateTransactionsConflicts,
} from "../models";
import {
  CreateTransactionRequest,
  GetAllTransactionsByStatusRequest,
  GetAllTransactionsByUserRequest,
  UpdateAllTransactionByUserRequest,
  UpdateTransactionByIdRequest,
  CancelTransactionRequest,
  GetApprovedBookingsByItemRequest,
  CheckTransactionConflictRequest,
  GetReservedByItemRequest,
} from "@/internal/validator/transaction.schema";

export interface TransactionService {
  createTransaction: (req: CreateTransactionRequest) => Promise<Transaction>;
  getAllTransactionsByUser: (
    filters: GetAllTransactionsByUserRequest,
    page: number,
  ) => Promise<GetAllTransactionsByUser>;
  getApprovedBookingsByItem: (
    req: GetApprovedBookingsByItemRequest,
  ) => Promise<GetAllTransactionsByItem[]>;
  getReservedByItem: (
    req: GetReservedByItemRequest,
  ) => Promise<GetAllTransactionsByItem[]>;
  getAllTransactionsByStatus: (
    req: GetAllTransactionsByStatusRequest,
    page: number,
  ) => Promise<{ numberOfPage: number; users: GetAllTransactionsByStatus[] }>;
  updateTransactionById: (req: UpdateTransactionByIdRequest) => Promise<void>;
  updateAllTransactionByUser: (
    req: UpdateAllTransactionByUserRequest,
  ) => Promise<void>;
  cancelTransaction: (req: CancelTransactionRequest) => Promise<void>;
  checkTransactionConflict: (
    req: CheckTransactionConflictRequest,
  ) => Promise<UpdateTransactionsConflicts>;
}

export interface TransactionRepository {
  getAllTransactionsByUser: (
    db: DBTransaction,
    filters: GetAllTransactionsByUserRequest,
    page: number,
  ) => Promise<GetAllTransactionsByUser>;
  getApprovedBookingsByItem: (
    db: DBTransaction,
    req: GetApprovedBookingsByItemRequest,
  ) => Promise<GetAllTransactionsByItem[]>;
  getReservedByItem: (
    db: DBTransaction,
    req: GetReservedByItemRequest,
  ) => Promise<any[]>;
  getAllTransactionsByStatus: (
    db: DBTransaction,
    filters: GetAllTransactionsByStatusRequest,
    page: number,
  ) => Promise<{ numberOfPage: number; users: GetAllTransactionsByStatus[] }>;
  createTransaction: (
    db: DBTransaction,
    transaction: NewTransaction,
  ) => Promise<Transaction>;
  createMessage: (db: DBTransaction, message: NewMessage[]) => Promise<void>;
  updateTransactionById: (
    db: DBTransaction,
    transaction: UpdateTransactionByIdRequest,
  ) => Promise<transactionIdList[]>;
  updateAllTransactionByUser: (
    db: DBTransaction,
    transactions: UpdateAllTransactionByUserRequest,
  ) => Promise<transactionIdList[][]>;
  cancelTransaction: (
    db: DBTransaction,
    transaction: CancelTransactionRequest,
  ) => Promise<void>;
  checkTransactionConflict: (
    db: DBTransaction,
    transactions: CheckTransactionConflictRequest,
  ) => Promise<UpdateTransactionsConflicts>;
  autoRejectExpiredTransactions: (
    db: DBTransaction,
  ) => Promise<{ id: number; startedAt: Date; endedAt: Date }[]>;
}
