import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import { listLedgerTransactions } from "@/lib/services/finance/ledger";

/** GET /api/finance/ledger - the journal view, gated by finance.ledger.read. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    if (session.user.role !== "admin") {
      throw new ForbiddenError("Only Andishi staff can view the ledger.");
    }
    await authorize(session, "finance.ledger.read");

    const transactions = await listLedgerTransactions();
    return NextResponse.json({ transactions });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "ledger.read",
    });
  }
}
