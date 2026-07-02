import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listOutstandingInvoices } from "@/lib/services/finance/reports";

/** GET /api/finance/reports/outstanding-invoices - the AR aging detail behind the summary balance. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const invoices = await listOutstandingInvoices({ session, requestId });
    return NextResponse.json({ invoices });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "report.export",
    });
  }
}
