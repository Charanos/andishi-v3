CREATE TYPE "public"."brief_type" AS ENUM('build', 'hire');--> statement-breakpoint
CREATE TYPE "public"."role_scope_type" AS ENUM('global', 'team', 'self');--> statement-breakpoint
CREATE TYPE "public"."team_kind" AS ENUM('delivery', 'finance', 'sales', 'marketing', 'talent_ops', 'support', 'platform');--> statement-breakpoint
ALTER TYPE "public"."brief_status" ADD VALUE 'scoping' BEFORE 'closed';--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_ip" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"module" text NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"scope_type" "role_scope_type" DEFAULT 'global' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"kind" "team_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"scope_team_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "domain" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "seniority" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "stack_tags" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "timeline" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "engagement_model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "brief_type" "brief_type" DEFAULT 'hire' NOT NULL;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "service_type" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "problem_statement" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "project_budget" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "project_timeline" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "target_launch_date" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "has_existing_product" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "existing_product_url" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "build_stack_preferences" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "brief_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "service_type" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vertical" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "public_slug" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "challenge" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "solution" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcome" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcome_label" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_quote" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_quote_attribution" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "featured_order" integer;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_scope_team_id_teams_id_fk" FOREIGN KEY ("scope_team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_resource_idx" ON "audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_public_slug_unique" UNIQUE("public_slug");