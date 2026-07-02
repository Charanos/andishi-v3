import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { runInvoiceGenerationJob } from "@/lib/jobs/generate-invoices";

/**
 * /api/jobs/generate-invoices - triggered by Vercel Cron (ADR-0008), which
 * sends a GET with an auto-attached `Authorization: Bearer $CRON_SECRET`
 * header; POST is exposed too for manual/admin-triggered runs with the
 * same header. Not a user session. Fails closed: unlike optional services
 * (Sentry, rate limiting) this endpoint writes real invoices/ledger
 * entries, so a missing CRON_SECRET blocks the route rather than letting
 * it through unauthenticated.
 */
async function handleTrigger(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return jsonError("CRON_SECRET is not configured.", 500);
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await runInvoiceGenerationJob();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Job failed", 500);
  }
}

export const GET = handleTrigger;
export const POST = handleTrigger;
