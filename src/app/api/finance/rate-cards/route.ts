import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { getClientIp } from "@/lib/api/request";
import { createRateCard, listRateCards } from "@/lib/services/finance/rate-cards";
import { createRateCardSchema } from "@/lib/validation/finance";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);

  try {
    const result = await listRateCards(
      { session, requestId },
      {
        subjectType: searchParams.get("subjectType") ?? undefined,
        subjectId: searchParams.get("subjectId") ?? undefined,
      },
    );
    return NextResponse.json({ rateCards: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "rate.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createRateCardSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const rateCard = await createRateCard(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ rateCard }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "rate.write",
    });
  }
}
