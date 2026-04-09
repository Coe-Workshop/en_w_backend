import * as cron from "node-cron";
import { DB } from "@/config/drizzle";
import { TransactionRepository } from "@/pkg/domain/transaction";

export class TransactionScheduler {
  private db: DB;
  private repository: TransactionRepository;
  private task: cron.ScheduledTask | null = null;

  constructor(db: DB, repository: TransactionRepository) {
    this.db = db;
    this.repository = repository;
  }

  start(): void {
    console.log("[Scheduler] Starting transaction auto-reject scheduler (every 30 minutes)");
    
    this.task = cron.schedule("*/30 * * * *", async () => {
      await this.autoRejectExpiredTransactions();
    });

    this.autoRejectExpiredTransactions();
  }

  stop(): void {
    if (this.task) {
      console.log("[Scheduler] Stopping transaction auto-reject scheduler");
      this.task.stop();
      this.task = null;
    }
  }

  private async autoRejectExpiredTransactions(): Promise<void> {
    const startTime = new Date();
    console.log(`[Scheduler] Running auto-reject job at ${startTime.toISOString()}`);

    try {
      const rejectedTransactions = await this.db.transaction(async (tx) => {
        return await this.repository.autoRejectExpiredTransactions(tx);
      });

      if (rejectedTransactions.length > 0) {
        console.log(`[Scheduler] Auto-rejected ${rejectedTransactions.length} expired transactions:`);
        rejectedTransactions.forEach((tx) => {
          console.log(`  - Transaction ID: ${tx.id}, Started: ${tx.startedAt.toISOString()}, Ended: ${tx.endedAt.toISOString()}`);
        });
      } else {
        console.log("[Scheduler] No expired transactions found");
      }
    } catch (error) {
      console.error("[Scheduler] Error auto-rejecting expired transactions:", error);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`[Scheduler] Job completed in ${duration}ms`);
  }
}

export default TransactionScheduler;
