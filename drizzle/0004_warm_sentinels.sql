CREATE TABLE "items_to_asset_ids" (
	"item_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	CONSTRAINT "items_to_asset_ids_item_id_asset_id_pk" PRIMARY KEY("item_id","asset_id")
);
--> statement-breakpoint
ALTER TABLE "assets" DROP CONSTRAINT "assets_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('RESERVER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."item_category";--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('MACHINE', 'HANDTOOL', 'ELECTRONIC', 'OTHER');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE "public"."item_category" USING "name"::"public"."item_category";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "prefix" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_uni_student" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp (6);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "asset_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "create_at" timestamp (6) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "started_at" timestamp (6) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "ended_at" timestamp (6) NOT NULL;--> statement-breakpoint
ALTER TABLE "items_to_asset_ids" ADD CONSTRAINT "items_to_asset_ids_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items_to_asset_ids" ADD CONSTRAINT "items_to_asset_ids_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reserver_id_users_id_fk" FOREIGN KEY ("reserver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree (LOWER("email"));--> statement-breakpoint
CREATE INDEX "idx_trgm_email" ON "users" USING gin ("email" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "deleted_at_at";--> statement-breakpoint
ALTER TABLE "assets" DROP COLUMN "assets_id";--> statement-breakpoint
