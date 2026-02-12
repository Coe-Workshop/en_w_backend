-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."item_category" AS ENUM('MACHINE', 'HANDTOOL', 'ELECTRONIC', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('REJECT', 'RESERVE', 'APPROVE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('RESERVER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"prefix" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"is_uni_student" boolean NOT NULL,
	"faculty" text,
	"role" "user_role" NOT NULL,
	"phone" varchar(32) NOT NULL,
	"created_at" timestamp(6) DEFAULT now() NOT NULL,
	"deleted_at" timestamp(6),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "item_category" NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"reserver_id" uuid NOT NULL,
	"create_at" timestamp(6) DEFAULT now() NOT NULL,
	"approver_id" uuid,
	"status" "transaction_status" DEFAULT 'RESERVE' NOT NULL,
	"started_at" timestamp(6) NOT NULL,
	"ended_at" timestamp(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"detail" text,
	"transaction_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT 'อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย',
	"category_id" integer NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"item_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree (lower(email) text_ops);
*/
