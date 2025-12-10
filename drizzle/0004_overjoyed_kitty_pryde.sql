CREATE TYPE "public"."transaction_status" AS ENUM('REJECT', 'RESERVE', 'APPROVE');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."item_category";--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('MACHINE', 'HANDTOOL', 'ELECTRONIC', 'OTHER');--> statement-breakpoint
ALTER TABLE "transactions" 
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'RESERVE';
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE "public"."item_category" USING "name"::"public"."item_category";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE "public"."transaction_status" USING "status"::text::"public"."transaction_status";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'RESERVE';
