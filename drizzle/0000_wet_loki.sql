CREATE TYPE "public"."item_category" AS ENUM('machine', 'measurement', 'electronic', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'approved', 'rejected', 'loaned', 'returned');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
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
	"description" text DEFAULT 'This item has no description provided',
	"image_url" text,
	"category_id" integer NOT NULL,
	"total" smallint NOT NULL
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
	"user_id" integer NOT NULL,
	"create_at" timestamp (6) DEFAULT now() NOT NULL,
	"approve_at" timestamp (6),
	"loan_at" timestamp (6),
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"update_at" timestamp (6),
	"item_id" integer NOT NULL,
	"user_approve" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"role" "user_role",
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
