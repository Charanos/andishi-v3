import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { listDealActivities, logDealActivity } from "@/lib/services/crm/deal-activities";
import { createDealActivitySchema } from "@/lib/validation/crm";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const activities = await listDealActivities({ session, requestId }, id);
    return NextResponse.json({ activities });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "deal.read",
    });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: dealId } = await context.params;
  const parsed = createDealActivitySchema.safeParse({ ...(await parseJson(req)), dealId });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const activity = await logDealActivity({ session, requestId }, parsed.data);
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "deal.write",
    });
  }
}
