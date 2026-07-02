import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import { generateRequestId, handleRouteError, jsonError, parseJson } from "@/lib/api/responses";
import { sendInvoice } from "@/lib/services/finance/invoices";
import { sendInvoiceSchema } from "@/lib/validation/finance";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = sendInvoiceSchema.safeParse((await parseJson(req)) ?? {});

  try {
    const invoice = await sendInvoice(
      { session, requestId, actorIp: getClientIp(req) },
      id,
      parsed.success ? parsed.data.issuedAt : undefined,
    );
    return NextResponse.json({ invoice });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "invoice.approve",
    });
  }
}
