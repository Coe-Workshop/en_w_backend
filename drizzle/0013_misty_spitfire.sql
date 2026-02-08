CREATE TABLE "assets_to_items" (
	"asset_id" integer NOT NULL,
	"item_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" DROP CONSTRAINT "assets_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "assets_to_items" ADD CONSTRAINT "assets_to_items_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets_to_items" ADD CONSTRAINT "assets_to_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" DROP COLUMN "item_id";