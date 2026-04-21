import { DBTransaction } from "@/config/drizzle";
import {
  GetAllTransactionsByItem,
  GetAllTransactionsByStatus,
  GetAllTransactionsByUser,
  NewMessage,
  NewTransaction,
  Transaction,
  transactionIdList,
  transactionStatus,
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
} from "@/internal/validator/transaction.schema";

export interface TransactionService {
  createTransaction: (req: CreateTransactionRequest) => Promise<Transaction>;
  getAllTransactionsByUser: (
    req: GetAllTransactionsByUserRequest,
    page: number,
  ) => Promise<GetAllTransactionsByUser>;
  getApprovedBookingsByItem: (
    req: GetApprovedBookingsByItemRequest,
  ) => Promise<GetAllTransactionsByItem[]>;
  getAllTransactionsByStatus: (
    req: GetAllTransactionsByStatusRequest | undefined,
    page: number,
  ) => Promise<GetAllTransactionsByStatus[]>;
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
    id: string,
    page: number,
  ) => Promise<GetAllTransactionsByUser>;
  getApprovedBookingsByItem: (
    db: DBTransaction,
    req: GetApprovedBookingsByItemRequest,
  ) => Promise<GetAllTransactionsByItem[]>;
  getAllTransactionsByStatus: (
    db: DBTransaction,
    status: transactionStatus | undefined,
    page: number,
  ) => Promise<GetAllTransactionsByStatus[]>;
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
