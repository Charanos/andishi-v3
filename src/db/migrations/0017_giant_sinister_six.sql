CREATE TYPE "public"."case_study_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "body" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "body" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "team_size" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "approach_steps" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "solution_highlights" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "results" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "testimonial" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tech_stack_details" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "seo_meta_title" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "seo_meta_description" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "seo_og_image_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "ad_excerpt" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "case_study_status" "case_study_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "published_at" timestamp with time zone;