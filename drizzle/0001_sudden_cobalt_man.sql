CREATE TABLE "items_to_categories" (
	"item_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "items_to_categories_item_id_category_id_pk" PRIMARY KEY("item_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp (6) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at_at" timestamp (6);--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;