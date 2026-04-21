import { TransactionScheduler } from "@/pkg/scheduler/transaction-scheduler";
import { TransactionRepository } from "@/pkg/domain/transaction";
import cron from "node-cron";

jest.mock("node-cron");

describe("TransactionScheduler", () => {
  let scheduler: TransactionScheduler;
  let mockDb: any;
  let mockRepository: jest.Mocked<TransactionRepository>;
  let mockScheduledTask: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockScheduledTask = {
      stop: jest.fn(),
    };

    (cron.schedule as jest.Mock).mockReturnValue(mockScheduledTask);

    mockDb = {
      transaction: jest.fn(),
    };

    mockRepository = {
      getAllTransactionsByUser: jest.fn(),
      getApprovedBookingsByItem: jest.fn(),
      getAllTransactionsByStatus: jest.fn(),
      createTransaction: jest.fn(),
      createMessage: jest.fn(),
      updateTransactionById: jest.fn(),
      updateAllTransactionByUser: jest.fn(),
      cancelTransaction: jest.fn(),
      checkTransactionConflict: jest.fn(),
      autoRejectExpiredTransactions: jest.fn(),
    };

    scheduler = new TransactionScheduler(mockDb, mockRepository);
  });

  describe("start", () => {
    it("should schedule job to run every 30 minutes", () => {
      scheduler.start();

      expect(cron.schedule).toHaveBeenCalledWith(
        "*/30 * * * *",
        expect.any(Function),
      );
    });

    it("should run immediately on startup", async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDb);
      });
      mockRepository.autoRejectExpiredTransactions.mockResolvedValue([]);

      scheduler.start();

      // Wait for the immediate execution
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockRepository.autoRejectExpiredTransactions).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should stop the scheduled task", () => {
      scheduler.start();
      scheduler.stop();

      expect(mockScheduledTask.stop).toHaveBeenCalled();
    });

    it("should not throw if scheduler was never started", () => {
      expect(() => scheduler.stop()).not.toThrow();
    });
  });

  describe("auto-reject job", () => {
    it("should reject expired transactions", async () => {
      const expiredTransactions = [
        {
          id: 1,
          startedAt: new Date("2026-04-10T10:00:00Z"),
          endedAt: new Date("2026-04-10T11:00:00Z"),
        },
        {
          id: 2,
          startedAt: new Date("2026-04-10T09:00:00Z"),
          endedAt: new Date("2026-04-10T10:00:00Z"),
        },
      ];

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDb);
      });
      mockRepository.autoRejectExpiredTransactions.mockResolvedValue(
        expiredTransactions,
      );

      scheduler.start();

      // Wait for the immediate execution
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockRepository.autoRejectExpiredTransactions).toHaveBeenCalled();
    });

    it("should handle empty results gracefully", async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDb);
      });
      mockRepository.autoRejectExpiredTransactions.mockResolvedValue([]);

      scheduler.start();

      // Wait for the immediate execution
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockRepository.autoRejectExpiredTransactions).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockDb.transaction.mockRejectedValue(new Error("Database error"));

      scheduler.start();

      // Wait for the immediate execution
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Scheduler] Error auto-rejecting expired transactions:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
