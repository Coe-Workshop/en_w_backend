CREATE TYPE "public"."user_role" AS ENUM('BORROWER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('MACHINE', 'MEASUREMENT', 'ELECTRONIC', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."transaction_groups_status" AS ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'LOANED', 'RETURNED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"role" "user_role",
	"created_at" timestamp (6) DEFAULT now() NOT NULL,
	"deleted_at_at" timestamp (6),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"assets_id" text NOT NULL,
	"item_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "item_category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT 'อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย',
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "items_to_categories" (
	"item_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "items_to_categories_item_id_category_id_pk" PRIMARY KEY("item_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"detail" text,
	"user_id" integer NOT NULL,
	"transaction_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_group_id" integer NOT NULL,
	"asset_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"create_at" timestamp (6) DEFAULT now() NOT NULL,
	"requested_user" uuid NOT NULL,
	"timeline_id" integer NOT NULL,
	"status" "transaction_groups_status" DEFAULT 'RETURNED' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items_to_categories" ADD CONSTRAINT "items_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;