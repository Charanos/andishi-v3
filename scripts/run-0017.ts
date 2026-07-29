import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function migrate() {
  console.log("🚀 Running 0017 schema migration via Pool...");

  const sqlContent = fs.readFileSync(
    path.join(process.cwd(), "src/db/migrations/0017_giant_sinister_six.sql"),
    "utf-8",
  );
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s);

  for (const statement of statements) {
    try {
      console.log("Executing:", statement);
      await pool.query(statement);
      console.log("✓ Success\n");
    } catch (e: unknown) {
      console.error("⨯ Error:", e instanceof Error ? e.message : String(e));
    }
  }

  console.log("Migration complete.");
  await pool.end();
}

migrate().catch(console.error);
