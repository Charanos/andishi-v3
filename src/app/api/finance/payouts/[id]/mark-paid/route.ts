import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import { generateRequestId, handleRouteError, jsonError, parseJson } from "@/lib/api/responses";
import { markPayoutPaid } from "@/lib/services/finance/payouts";
import { markPayoutPaidSchema } from "@/lib/validation/finance";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = markPayoutPaidSchema.safeParse((await parseJson(req)) ?? {});

  try {
    const payout = await markPayoutPaid(
      { session, requestId, actorIp: getClientIp(req) },
      id,
      parsed.success ? parsed.data.paidAt : undefined,
    );
    return NextResponse.json({ payout });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "payout.approve",
    });
  }
}
