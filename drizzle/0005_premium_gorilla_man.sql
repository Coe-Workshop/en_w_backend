ALTER TABLE "items_to_asset_ids" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "items_to_asset_ids" CASCADE;--> statement-breakpoint
ALTER TABLE "assets" RENAME COLUMN "asset_number" TO "asset_id";--> statement-breakpoint
