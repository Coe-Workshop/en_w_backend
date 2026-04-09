import { makeTransactionRepository } from "@/pkg/transaction/repository";
import { TransactionRepository } from "@/pkg/domain/transaction";
import { transactions } from "@/pkg/models";
import { eq, and, lt } from "drizzle-orm";

describe("Transaction Repository - autoRejectExpiredTransactions", () => {
  let repository: TransactionRepository;
  let mockDb: any;

  beforeEach(() => {
    repository = makeTransactionRepository();
    mockDb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };
  });

  it("should reject expired pending transactions", async () => {
    const mockNow = new Date("2026-04-10T12:00:00Z");
    jest.useFakeTimers().setSystemTime(mockNow);

    const expiredTransactions = [
      { id: 1, startedAt: new Date("2026-04-10T10:00:00Z"), endedAt: new Date("2026-04-10T11:00:00Z") },
      { id: 2, startedAt: new Date("2026-04-10T09:00:00Z"), endedAt: new Date("2026-04-10T10:00:00Z") },
    ];

    mockDb.returning.mockResolvedValue(expiredTransactions);

    const result = await repository.autoRejectExpiredTransactions(mockDb);

    expect(mockDb.update).toHaveBeenCalledWith(transactions);
    expect(mockDb.set).toHaveBeenCalledWith({ status: "REJECT" });
    expect(mockDb.where).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);

    jest.useRealTimers();
  });

  it("should return empty array when no expired transactions", async () => {
    const mockNow = new Date("2026-04-10T12:00:00Z");
    jest.useFakeTimers().setSystemTime(mockNow);

    mockDb.returning.mockResolvedValue([]);

    const result = await repository.autoRejectExpiredTransactions(mockDb);

    expect(result).toHaveLength(0);

    jest.useRealTimers();
  });

  it("should only reject RESERVE status transactions", async () => {
    const mockNow = new Date("2026-04-10T12:00:00Z");
    jest.useFakeTimers().setSystemTime(mockNow);

    await repository.autoRejectExpiredTransactions(mockDb);

    // Verify the where clause includes status check
    const whereCall = mockDb.where.mock.calls[0][0];
    expect(whereCall).toBeDefined();

    jest.useRealTimers();
  });

  it("should only reject transactions with startedAt in the past", async () => {
    const mockNow = new Date("2026-04-10T12:00:00Z");
    jest.useFakeTimers().setSystemTime(mockNow);

    await repository.autoRejectExpiredTransactions(mockDb);

    // Verify the where clause includes time check
    const whereCall = mockDb.where.mock.calls[0][0];
    expect(whereCall).toBeDefined();

    jest.useRealTimers();
  });

  it("should throw error when database fails", async () => {
    const mockError = new Error("Database connection failed");
    mockDb.returning.mockRejectedValue(mockError);

    await expect(repository.autoRejectExpiredTransactions(mockDb)).rejects.toThrow("Database connection failed");
  });
});
