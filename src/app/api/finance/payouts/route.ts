import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { withIdempotency } from "@/lib/api/idempotency";
import { createPayout, listPayouts } from "@/lib/services/finance/payouts";
import { createPayoutSchema } from "@/lib/validation/finance";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listPayouts({ session, requestId });
    return NextResponse.json({ payouts: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "payout.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createPayoutSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    return await withIdempotency(req, session.user.id, "payouts.create", async () => {
      const payout = await createPayout(
        { session, requestId, actorIp: getClientIp(req) },
        parsed.data,
      );
      return { status: 201, body: { payout } };
    });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "payout.write",
    });
  }
}
