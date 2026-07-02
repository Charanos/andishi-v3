import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { idempotencyKeys } from "@/db/schema";

/**
 * Part 7's Idempotency-Key convention: "mutating POSTs that create money/
 * records accept an Idempotency-Key header." Wrap a route's mutation with
 * this so a client retry (dropped response, double-click, network blip)
 * replays the original result instead of creating a second invoice/
 * payout/expense. No header present = normal behavior, unchanged - this
 * is opt-in from the client's side, not enforced.
 *
 * Usage:
 *   const idempotent = await withIdempotency(req, session.user.id, "invoices.create", async () => {
 *     const invoice = await createInvoice(ctx, data);
 *     return { status: 201, body: { invoice } };
 *   });
 *   if (idempotent) return idempotent;
 */
export async function withIdempotency(
  req: NextRequest,
  userId: string | undefined,
  route: string,
  handler: () => Promise<{ status: number; body: unknown }>,
): Promise<NextResponse> {
  const key = req.headers.get("idempotency-key");

  if (!key) {
    const result = await handler();
    return NextResponse.json(result.body, { status: result.status });
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .limit(1);

  if (existing) {
    return NextResponse.json(existing.responseBody, { status: existing.responseStatus });
  }

  const result = await handler();

  // Only successful mutations are worth replaying - a validation error or
  // a transient 500 should be retryable with the same key, not "stuck".
  if (result.status >= 200 && result.status < 300) {
    await db
      .insert(idempotencyKeys)
      .values({ key, userId, route, responseStatus: result.status, responseBody: result.body })
      .onConflictDoNothing();
  }

  return NextResponse.json(result.body, { status: result.status });
}
