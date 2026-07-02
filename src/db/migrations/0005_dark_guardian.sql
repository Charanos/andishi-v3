CREATE TYPE "public"."budget_scope_type" AS ENUM('org', 'project', 'department');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('pending', 'approved', 'rejected', 'reimbursed');--> statement-breakpoint
CREATE TYPE "public"."invoice_line_item_source" AS ENUM('timesheet', 'milestone', 'manual');--> statement-breakpoint
CREATE TYPE "public"."ledger_account_type" AS ENUM('asset', 'liability', 'revenue', 'expense', 'equity');--> statement-breakpoint
CREATE TYPE "public"."ledger_direction" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."ledger_transaction_kind" AS ENUM('invoice', 'payout', 'expense', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'approved', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."rate_kind" AS ENUM('bill', 'pay');--> statement-breakpoint
CREATE TYPE "public"."rate_subject_type" AS ENUM('engineer', 'client', 'org');--> statement-breakpoint
CREATE TYPE "public"."rate_unit" AS ENUM('hour', 'day', 'month', 'project');--> statement-breakpoint
CREATE TYPE "public"."invoice_source" AS ENUM('timesheet', 'milestone', 'manual');--> statement-breakpoint
CREATE TYPE "public"."job_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_type" "budget_scope_type" NOT NULL,
	"scope_id" uuid NOT NULL,
	"period" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"project_id" uuid,
	"category" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"incurred_on" text NOT NULL,
	"status" "expense_status" DEFAULT 'pending' NOT NULL,
	"receipt_url" text,
	"entered_by" uuid NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"ledger_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_amount_cents" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"source_type" "invoice_line_item_source" DEFAULT 'manual' NOT NULL,
	"source_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "ledger_account_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_accounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"direction" "ledger_direction" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"memo" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "ledger_transaction_kind" NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" uuid NOT NULL,
	"description" text NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engineer_id" uuid NOT NULL,
	"period_start" text NOT NULL,
	"period_end" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"method" text,
	"reference" text,
	"stripe_transfer_id" text,
	"wise_transfer_id" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"ledger_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" "rate_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"kind" "rate_kind" NOT NULL,
	"amount_cents" integer NOT NULL,
	"unit" "rate_unit" DEFAULT 'hour' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_key" text NOT NULL,
	"status" "job_run_status" DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"error" text,
	"payload" jsonb
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "invoice_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "subtotal_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "source" "invoice_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "ledger_transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_ledger_transaction_id_ledger_transactions_id_fk" FOREIGN KEY ("ledger_transaction_id") REFERENCES "public"."ledger_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_ledger_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."ledger_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_ledger_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_ledger_transaction_id_ledger_transactions_id_fk" FOREIGN KEY ("ledger_transaction_id") REFERENCES "public"."ledger_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budgets_scope_idx" ON "budgets" USING btree ("scope_type","scope_id");--> statement-breakpoint
CREATE INDEX "budgets_period_idx" ON "budgets" USING btree ("period");--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_project_idx" ON "expenses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "invoice_line_items_invoice_idx" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_transaction_idx" ON "ledger_entries" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_account_idx" ON "ledger_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "ledger_transactions_reference_idx" ON "ledger_transactions" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payouts_engineer_idx" ON "payouts" USING btree ("engineer_id");--> statement-breakpoint
CREATE INDEX "rate_cards_subject_idx" ON "rate_cards" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "rate_cards_kind_idx" ON "rate_cards" USING btree ("kind");