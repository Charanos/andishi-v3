CREATE TYPE "public"."cms_content_type" AS ENUM('services_content', 'skill_domain', 'faq', 'blog_post', 'testimonial');--> statement-breakpoint
CREATE TYPE "public"."faq_section" AS ENUM('landing', 'services', 'hire', 'careers', 'general');--> statement-breakpoint
CREATE TYPE "public"."service_glow" AS ENUM('violet', 'cyan', 'amber');--> statement-breakpoint
CREATE TYPE "public"."service_group" AS ENUM('product-delivery', 'specialist-builds');--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" "cms_content_type" NOT NULL,
	"content_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"editor_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" "faq_section" NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"timeline" text NOT NULL,
	"glow" "service_glow" NOT NULL,
	"group" "service_group" NOT NULL,
	"tagline" text NOT NULL,
	"image_url" text,
	"scope" text NOT NULL,
	"engagement_options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stack_highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skill_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"eyebrow" text NOT NULL,
	"h1" text NOT NULL,
	"subheadline" text NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"use_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"differentiators" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_domains_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_editor_user_id_users_id_fk" FOREIGN KEY ("editor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_revisions_content_idx" ON "content_revisions" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "faqs_section_idx" ON "faqs" USING btree ("section");--> statement-breakpoint
CREATE INDEX "services_content_published_idx" ON "services_content" USING btree ("published");--> statement-breakpoint
CREATE INDEX "services_content_order_idx" ON "services_content" USING btree ("order");--> statement-breakpoint
CREATE INDEX "skill_domains_published_idx" ON "skill_domains" USING btree ("published");