CREATE TYPE "public"."engagement_type" AS ENUM('freelance', 'internal', 'outsourced', 'partner');--> statement-breakpoint
CREATE TYPE "public"."engineer_vetting_status" AS ENUM('not_started', 'in_progress', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."vetting_pipeline_stage" AS ENUM('application_review', 'technical_screen', 'system_design', 'culture_fit', 'reference_check', 'final_decision');--> statement-breakpoint
CREATE TYPE "public"."vetting_stage_status" AS ENUM('pending', 'passed', 'failed', 'skipped');--> statement-breakpoint
CREATE TABLE "availability_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engineer_id" uuid NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"capacity_hours_per_week" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineer_skills" (
	"engineer_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"years" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "engineer_skills_engineer_id_skill_id_pk" PRIMARY KEY("engineer_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vetting_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engineer_id" uuid NOT NULL,
	"stage" "vetting_pipeline_stage" NOT NULL,
	"status" "vetting_stage_status" DEFAULT 'pending' NOT NULL,
	"reviewer_user_id" uuid,
	"notes" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "engineers" ADD COLUMN "vetting_status" "engineer_vetting_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "engineers" ADD COLUMN "engagement_type" "engagement_type" DEFAULT 'freelance' NOT NULL;--> statement-breakpoint
ALTER TABLE "engineers" ADD COLUMN "supply_source" text;--> statement-breakpoint
ALTER TABLE "engineers" ADD COLUMN "internal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "availability_windows" ADD CONSTRAINT "availability_windows_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engineer_skills" ADD CONSTRAINT "engineer_skills_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engineer_skills" ADD CONSTRAINT "engineer_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vetting_stages" ADD CONSTRAINT "vetting_stages_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vetting_stages" ADD CONSTRAINT "vetting_stages_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_windows_engineer_idx" ON "availability_windows" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "engineer_skills_engineer_idx" ON "engineer_skills" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "vetting_stages_engineer_idx" ON "vetting_stages" USING btree ("engineer_id");