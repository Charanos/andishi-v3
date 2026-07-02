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
import { createLead, listLeads } from "@/lib/services/crm/leads";
import { createLeadSchema } from "@/lib/validation/crm";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);

  try {
    const result = await listLeads(
      { session, requestId },
      {
        status: searchParams.get("status") ?? undefined,
        ownerUserId: searchParams.get("ownerUserId") ?? undefined,
      },
    );
    return NextResponse.json({ leads: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "lead.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createLeadSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const lead = await createLead({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "lead.write",
    });
  }
}
