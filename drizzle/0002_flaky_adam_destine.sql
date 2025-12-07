ALTER TABLE "items_to_categories" DROP CONSTRAINT "items_to_categories_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "items_to_categories" DROP CONSTRAINT "items_to_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;