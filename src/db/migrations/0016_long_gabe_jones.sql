CREATE TYPE "public"."governance_severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."governance_status" AS ENUM('clean', 'review', 'exception', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."governance_surface" AS ENUM('commercial', 'identity', 'delivery', 'content', 'support');--> statement-breakpoint
CREATE TABLE "governance_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"scope" text NOT NULL,
	"surface" "governance_surface" NOT NULL,
	"status" "governance_status" DEFAULT 'review' NOT NULL,
	"severity" "governance_severity" DEFAULT 'medium' NOT NULL,
	"actor" text NOT NULL,
	"owner" text NOT NULL,
	"policy" text NOT NULL,
	"next_action" text NOT NULL,
	"report_cadence" text NOT NULL,
	"amount_protected" integer DEFAULT 0 NOT NULL,
	"client_visible" boolean DEFAULT false NOT NULL,
	"developer_visible" boolean DEFAULT false NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_url" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "governance_controls" ADD CONSTRAINT "governance_controls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_controls" ADD CONSTRAINT "governance_controls_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;