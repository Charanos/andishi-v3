CREATE TYPE "public"."sprint_status" AS ENUM('planned', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'in_review', 'done', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."project_billing_type" AS ENUM('fixed', 'time_and_materials', 'retainer');--> statement-breakpoint
CREATE TYPE "public"."project_health" AS ENUM('on_track', 'at_risk', 'off_track');--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engineer_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"week_start" text NOT NULL,
	"planned_minutes" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_date" text,
	"amount_cents" integer,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"start_date" text,
	"end_date" text,
	"status" "sprint_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_dependencies" (
	"task_id" uuid NOT NULL,
	"depends_on_task_id" uuid NOT NULL,
	CONSTRAINT "task_dependencies_task_id_depends_on_task_id_pk" PRIMARY KEY("task_id","depends_on_task_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"sprint_id" uuid,
	"parent_task_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"assignee_engineer_id" uuid,
	"reporter_user_id" uuid NOT NULL,
	"estimate_minutes" integer,
	"due_date" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "health" "project_health" DEFAULT 'on_track' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "budget_cents" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "billing_type" "project_billing_type";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lead_pm_user_id" uuid;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD COLUMN "invoice_id" uuid;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_tasks_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_engineer_id_engineers_id_fk" FOREIGN KEY ("assignee_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "allocations_engineer_id_idx" ON "allocations" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "allocations_project_id_idx" ON "allocations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "milestones_project_id_idx" ON "milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sprints_project_id_idx" ON "sprints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_milestone_id_idx" ON "tasks" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "tasks_sprint_id_idx" ON "tasks" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_engineer_id_idx" ON "tasks" USING btree ("assignee_engineer_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_pm_user_id_users_id_fk" FOREIGN KEY ("lead_pm_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timesheet_entries_project_id_idx" ON "timesheet_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "timesheet_entries_engineer_id_idx" ON "timesheet_entries" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "timesheet_entries_task_id_idx" ON "timesheet_entries" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "timesheet_entries_status_idx" ON "timesheet_entries" USING btree ("status");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_code_unique" UNIQUE("code");