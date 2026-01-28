ALTER TABLE "transactions" ALTER COLUMN "create_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "create_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "started_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "ended_at" SET DATA TYPE timestamp;