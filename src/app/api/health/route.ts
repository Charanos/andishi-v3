import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { captureException } from "@/lib/observability/capture";

/**
 * Presence-only checks (never the actual secret values) so this stays safe
 * to expose on an unauthenticated route and to an admin Settings panel.
 */
function getIntegrationStatus() {
  return {
    email: Boolean(process.env.RESEND_API_KEY),
    rateLimiting: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
    errorTracking: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    fileStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };
}

/**
 * Unauthenticated liveness/readiness check for uptime monitors and
 * deploy verification, and the data source for the admin Settings "System
 * status" panel. Deliberately returns no error detail on DB failure - the
 * real error is reported to Sentry/logs instead.
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
      integrations: getIntegrationStatus(),
    });
  } catch (error) {
    captureException(error, { module: "platform", action: "health.check" });
    return NextResponse.json(
      { status: "error", db: "unreachable", integrations: getIntegrationStatus() },
      { status: 503 },
    );
  }
}
