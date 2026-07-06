/**
 * scripts/wipe-prod-content.ts
 *
 * Wipes ALL business/content data from the PRODUCTION database while
 * preserving login and authorization infrastructure, establishing the
 * dev/prod separation convention: dev (.env.local branch) carries seeded
 * demo content, production starts empty and is populated exclusively
 * through the admin CMS.
 *
 * KEPT (never touched):
 *   - users              (seed accounts keep their logins)
 *   - permissions        (RBAC catalog - required for authorize())
 *   - roles / role_permissions
 *   - teams / team_members
 *   - user_roles         (super_admin assignment etc.)
 *
 * WIPED: every other table in the public schema (briefs, projects,
 * testimonials, blog_posts, job_openings, finance, CRM, CMS, marketing,
 * support, messaging, scheduling, audit/activity logs, sessions, ...).
 * Sessions/tokens are wiped too - seed users just sign in again.
 *
 * After the wipe, users.organization_id / engineer_id are nulled so no
 * seed account points at a deleted organization or engineer row.
 *
 * Run with: npm run db:wipe:prod -- --yes
 * The --yes flag is required; without it the script only prints the plan.
 */

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const KEEP_TABLES = new Set([
  "users",
  "permissions",
  "roles",
  "role_permissions",
  "teams",
  "team_members",
  "user_roles",
]);

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Ensure .env (production) is loaded.");
  }

  const confirmed = process.argv.includes("--yes");

  console.log("🧹  Production content wipe");
  console.log(`    Target host: ${new URL(databaseUrl).hostname}`);

  const pool = new Pool({ connectionString: databaseUrl });

  const { rows } = await pool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );

  const toWipe = rows.map((r) => r.tablename).filter((t) => !KEEP_TABLES.has(t));
  const kept = rows.map((r) => r.tablename).filter((t) => KEEP_TABLES.has(t));

  console.log(`\n    Keeping (${kept.length}): ${kept.join(", ")}`);
  console.log(`\n    Wiping (${toWipe.length}): ${toWipe.join(", ")}`);

  if (!confirmed) {
    console.log("\n⚠️   Dry run only - re-run with --yes to execute the wipe.\n");
    await pool.end();
    return;
  }

  // TRUNCATE ... CASCADE resolves FK ordering. CASCADE cannot reach the
  // kept tables: users has no outgoing FKs, and the authz tables only
  // reference each other and users.
  const quoted = toWipe.map((t) => `"${t}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${quoted} CASCADE`);
  console.log("\n    ✓ Content tables truncated");

  const { rowCount } = await pool.query(
    `UPDATE users SET organization_id = NULL, engineer_id = NULL
     WHERE organization_id IS NOT NULL OR engineer_id IS NOT NULL`,
  );
  console.log(`    ✓ Cleared dangling org/engineer refs on ${rowCount ?? 0} user(s)`);

  const users = await pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM users`);
  console.log(`    ✓ ${users.rows[0].count} seed user account(s) preserved`);

  await pool.end();
  console.log("\n✅  Production wipe complete. Content is now managed via the admin dashboard.\n");
}

main().catch((err) => {
  console.error("\n❌  Wipe failed:", err);
  process.exit(1);
});
