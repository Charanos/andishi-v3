/**
 * scripts/seed-prod.ts
 *
 * Seeds the PRODUCTION database with ONLY admin/seed user accounts.
 * Zero content data — all CMS content is managed via the admin dashboard.
 *
 * Run with: npm run db:seed:prod
 *
 * WARNING: This is for first-time prod setup only.
 * It uses onConflictDoNothing() so it is safe to run if accounts already exist.
 * Change the admin password immediately after first login.
 */

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";

neonConfig.webSocketConstructor = ws;

const PROD_ADMIN_EMAIL = "dennis@andishi.dev";
const PROD_ADMIN_INITIAL_PASSWORD = "ChangeMe123!"; // Admin must change this after first login

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Ensure .env (production) is loaded before running this script.",
    );
  }

  console.log("🚀  Connecting to production database...");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  const passwordHash = await bcrypt.hash(PROD_ADMIN_INITIAL_PASSWORD, 10);

  console.log("\n👤  Seeding admin users...");
  await db
    .insert(schema.users)
    .values({
      email: PROD_ADMIN_EMAIL,
      name: "Dennis Ng'ang'a",
      role: "admin" as const,
      status: "active" as const,
      passwordHash,
      emailVerified: true,
    })
    .onConflictDoNothing();

  console.log(`   ✓ Admin user seeded: ${PROD_ADMIN_EMAIL}`);
  console.log(`   ⚠  Initial password: "${PROD_ADMIN_INITIAL_PASSWORD}" — CHANGE IMMEDIATELY.`);

  await pool.end();
  console.log(
    "\n✅  Production seed complete. No content data was seeded — manage via the admin dashboard.\n",
  );
}

main().catch((err) => {
  console.error("\n❌  Prod seed failed:", err);
  process.exit(1);
});
