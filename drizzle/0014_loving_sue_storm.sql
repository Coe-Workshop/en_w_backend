ALTER TABLE "assets_to_items" DROP CONSTRAINT "assets_to_items_asset_id_assets_id_fk";
--> statement-breakpoint
ALTER TABLE "assets_to_items" ADD CONSTRAINT "assets_to_items_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;