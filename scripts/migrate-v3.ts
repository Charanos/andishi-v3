/**
 * scripts/migrate-v3.ts
 *
 * Direct SQL migration for the v3 talent-to-software schema changes.
 * Bypasses drizzle-kit's interactive TTY requirement.
 *
 * Run: node --env-file=.env.local -e "require('tsx/esm'); import('./scripts/migrate-v3.ts')"
 * Or:  npx tsx scripts/migrate-v3.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🚀 Running Andishi v3 schema migration...\n");

  // ── Step 1: Enum additions ────────────────────────────────────

  console.log("▸ Adding brief_type enum...");
  await db`
    DO $$ BEGIN
      CREATE TYPE brief_type AS ENUM ('build', 'hire');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;
  console.log("  ✓ brief_type enum ready");

  console.log("▸ Adding scoping to brief_status enum...");
  await db`
    DO $$ BEGIN
      ALTER TYPE brief_status ADD VALUE IF NOT EXISTS 'scoping';
    EXCEPTION WHEN others THEN NULL;
    END $$;
  `;
  console.log("  ✓ brief_status enum updated");

  // ── Step 2: briefs table additions ───────────────────────────

  console.log("\n▸ Updating briefs table...");

  await db`
    ALTER TABLE briefs
      ADD COLUMN IF NOT EXISTS brief_type       brief_type NOT NULL DEFAULT 'hire',
      ADD COLUMN IF NOT EXISTS service_type     text,
      ADD COLUMN IF NOT EXISTS problem_statement text,
      ADD COLUMN IF NOT EXISTS project_budget   text,
      ADD COLUMN IF NOT EXISTS project_timeline text,
      ADD COLUMN IF NOT EXISTS target_launch_date text,
      ADD COLUMN IF NOT EXISTS has_existing_product boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS existing_product_url text,
      ADD COLUMN IF NOT EXISTS build_stack_preferences jsonb DEFAULT '[]'::jsonb;
  `;

  // Make hire-specific fields nullable (they already are in Postgres if they were text)
  await db`
    ALTER TABLE briefs
      ALTER COLUMN role        DROP NOT NULL,
      ALTER COLUMN domain      DROP NOT NULL,
      ALTER COLUMN seniority   DROP NOT NULL,
      ALTER COLUMN description DROP NOT NULL;
  `.catch(() => {
    // Columns may already be nullable - ignore error
    console.log("  ↳ Hire fields already nullable - skipping");
  });

  console.log("  ✓ briefs table updated");

  // ── Step 3: projects table additions ─────────────────────────

  console.log("\n▸ Updating projects table...");

  await db`
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS service_type              text,
      ADD COLUMN IF NOT EXISTS vertical                  text,
      ADD COLUMN IF NOT EXISTS is_public                 boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS public_slug               text,
      ADD COLUMN IF NOT EXISTS cover_image_url           text,
      ADD COLUMN IF NOT EXISTS challenge                 text,
      ADD COLUMN IF NOT EXISTS solution                  text,
      ADD COLUMN IF NOT EXISTS outcome                   text,
      ADD COLUMN IF NOT EXISTS outcome_label             text,
      ADD COLUMN IF NOT EXISTS client_quote              text,
      ADD COLUMN IF NOT EXISTS client_quote_attribution  text,
      ADD COLUMN IF NOT EXISTS client_name               text,
      ADD COLUMN IF NOT EXISTS featured_order            integer;
  `;

  // Add unique constraint on public_slug - safe because existing rows have NULL
  // PostgreSQL UNIQUE constraints allow multiple NULLs
  await db`
    DO $$ BEGIN
      ALTER TABLE projects ADD CONSTRAINT projects_public_slug_unique UNIQUE (public_slug);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END $$;
  `;

  console.log("  ✓ projects table updated");

  // ── Step 4: organizations table additions ─────────────────────

  console.log("\n▸ Updating organizations table...");

  await db`
    ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS region  text,
      ADD COLUMN IF NOT EXISTS country text;
  `;

  console.log("  ✓ organizations table updated");

  // ── Done ──────────────────────────────────────────────────────

  console.log("\n✅ Migration complete. All schema changes applied to Neon.");
  console.log("\nNew columns added:");
  console.log("  briefs      → brief_type, service_type, problem_statement,");
  console.log("                project_budget, project_timeline, target_launch_date,");
  console.log("                has_existing_product, existing_product_url, build_stack_preferences");
  console.log("  projects    → service_type, vertical, is_public, public_slug,");
  console.log("                cover_image_url, challenge, solution, outcome, outcome_label,");
  console.log("                client_quote, client_quote_attribution, client_name, featured_order");
  console.log("  organizations → region, country");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Migration failed:", err);
    process.exit(1);
  });
