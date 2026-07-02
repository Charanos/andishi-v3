CREATE TYPE "public"."blog_category" AS ENUM('Hiring', 'African Tech', 'Remote Work', 'Engineering');--> statement-breakpoint
CREATE TYPE "public"."blog_post_status" AS ENUM('published', 'draft', 'archived');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" "blog_category" NOT NULL,
	"excerpt" text NOT NULL,
	"cover_image" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"author_avatar_url" text NOT NULL,
	"date_published" text NOT NULL,
	"date_modified" text NOT NULL,
	"read_time" integer DEFAULT 5 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"author_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category");