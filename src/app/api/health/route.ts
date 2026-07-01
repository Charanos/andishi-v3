import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { captureException } from "@/lib/observability/capture";

/**
 * Unauthenticated liveness/readiness check for uptime monitors and
 * deploy verification. Deliberately returns no error detail on failure -
 * the real error is reported to Sentry/logs instead.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await getDb().execute(sql`select 1`);

    return NextResponse.json({
      status: "ok",
      db: "ok",
      latencyMs: Date.now() - startedAt,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    captureException(error, { module: "platform", action: "health.check" });
    return NextResponse.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
