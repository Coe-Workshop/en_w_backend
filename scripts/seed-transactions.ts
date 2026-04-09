import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/pkg/models";
import { eq, sql } from "drizzle-orm";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema, casing: "snake_case" });

async function seedTransactions() {
  console.log("Starting transaction seed...\n");

  try {
    // Get existing users, items, and assets
    const users = await db.select().from(schema.users);
    const items = await db.select().from(schema.items);
    const assets = await db.select().from(schema.assets);

    if (users.length === 0) {
      console.log("No users found. Please create users first.");
      return;
    }
    if (items.length === 0) {
      console.log("No items found. Please run seed-items first.");
      return;
    }
    console.log(`Found: ${users.length} users, ${items.length} items, ${assets.length} assets`);

    // Create assets if needed
    if (assets.length < 10) {
      console.log(`Only ${assets.length} assets found. Creating more assets...\n`);
      for (let i = 0; i < Math.min(10, items.length); i++) {
        const assetId = `AST-${String(i + 1).padStart(4, '0')}`;
        const existing = await db
          .select()
          .from(schema.assets)
          .where(eq(schema.assets.assetID, assetId));
        
        if (existing.length === 0) {
          await db.insert(schema.assets).values({
            assetID: assetId,
            itemID: items[i].id,
            status: "AVAILABLE",
          });
          console.log(`Created asset: ${assetId} for item: ${items[i].name}`);
        }
      }
      // Refresh assets list
      assets.push(...await db.select().from(schema.assets));
    }

    console.log(`\n`);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const transactionsData = [
      // Expired transactions (should be auto-rejected by cron)
      {
        assetID: assets[0]?.id || 1,
        itemID: items[0]?.id || 1,
        reserverID: users[0]?.id,
        status: "RESERVE" as const,
        startedAt: twoHoursAgo,
        endedAt: oneHourAgo,
        description: "Expired: Should be auto-rejected",
      },
      {
        assetID: assets[1]?.id || 2,
        itemID: items[1]?.id || 2,
        reserverID: users[0]?.id,
        status: "RESERVE" as const,
        startedAt: yesterday,
        endedAt: twoHoursAgo,
        description: "Expired yesterday",
      },
      // Current pending reservations
      {
        assetID: assets[2]?.id || 3,
        itemID: items[2]?.id || 3,
        reserverID: users[0]?.id,
        status: "RESERVE" as const,
        startedAt: oneHourLater,
        endedAt: twoHoursLater,
        description: "Pending: Starting in 1 hour",
      },
      {
        assetID: assets[3]?.id || 4,
        itemID: items[3]?.id || 4,
        reserverID: users[0]?.id,
        status: "RESERVE" as const,
        startedAt: tomorrow,
        endedAt: new Date(tomorrow.getTime() + 60 * 60 * 1000),
        description: "Pending: Tomorrow",
      },
      // Approved reservations
      {
        assetID: assets[4]?.id || 5,
        itemID: items[4]?.id || 5,
        reserverID: users[0]?.id,
        approverID: users[0]?.id, // Self-approved for seeding
        status: "APPROVE" as const,
        startedAt: oneHourLater,
        endedAt: twoHoursLater,
        description: "Approved: Starting in 1 hour",
      },
      {
        assetID: assets[5]?.id || 6,
        itemID: items[5]?.id || 6,
        reserverID: users[0]?.id,
        approverID: users[0]?.id,
        status: "APPROVE" as const,
        startedAt: tomorrow,
        endedAt: new Date(tomorrow.getTime() + 60 * 60 * 1000),
        description: "Approved: Tomorrow",
      },
      // Rejected reservations
      {
        assetID: assets[6]?.id || 7,
        itemID: items[6]?.id || 7,
        reserverID: users[0]?.id,
        approverID: users[0]?.id,
        status: "REJECT" as const,
        startedAt: oneHourLater,
        endedAt: twoHoursLater,
        description: "Rejected: Starting in 1 hour",
      },
      {
        assetID: assets[7]?.id || 8,
        itemID: items[7]?.id || 8,
        reserverID: users[0]?.id,
        approverID: users[0]?.id,
        status: "REJECT" as const,
        startedAt: tomorrow,
        endedAt: new Date(tomorrow.getTime() + 60 * 60 * 1000),
        description: "Rejected: Tomorrow",
      },
      // Already ended transactions
      {
        assetID: assets[8]?.id || 9,
        itemID: items[8]?.id || 9,
        reserverID: users[0]?.id,
        approverID: users[0]?.id,
        status: "APPROVE" as const,
        startedAt: twoHoursAgo,
        endedAt: oneHourAgo,
        description: "Approved but already ended",
      },
      {
        assetID: assets[9]?.id || 10,
        itemID: items[9]?.id || 10,
        reserverID: users[0]?.id,
        approverID: users[0]?.id,
        status: "REJECT" as const,
        startedAt: twoHoursAgo,
        endedAt: oneHourAgo,
        description: "Rejected and already ended",
      },
    ];

    console.log("Seeding transactions...\n");
    let inserted = 0;
    let skipped = 0;

    for (const txn of transactionsData) {
      // Check if similar transaction exists
      const existing = await db
        .select()
        .from(schema.transactions)
        .where(
          sql`${schema.transactions.assetID} = ${txn.assetID} 
              AND ${schema.transactions.startedAt} = ${txn.startedAt}
              AND ${schema.transactions.reserverID} = ${txn.reserverID}`
        );

      if (existing.length === 0) {
        await db.insert(schema.transactions).values({
          assetID: txn.assetID,
          itemID: txn.itemID,
          reserverID: txn.reserverID,
          approverID: txn.approverID,
          status: txn.status,
          startedAt: txn.startedAt,
          endedAt: txn.endedAt,
        });
        console.log(`${txn.status}: ${txn.description}`);
        inserted++;
      } else {
        console.log(`- Skipped: ${txn.description} (already exists)`);
        skipped++;
      }
    }

    console.log(`\nTransaction seed completed!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\nSummary:`);
    console.log(`   - 2 expired pending transactions (will be auto-rejected by cron)`);
    console.log(`   - 2 active pending reservations`);
    console.log(`   - 2 approved reservations`);
    console.log(`   - 2 rejected reservations`);
    console.log(`   - 2 completed transactions (ended)`);

  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTransactions();
