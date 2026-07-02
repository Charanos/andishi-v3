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
import { createExpense, listExpenses } from "@/lib/services/finance/expenses";
import { createExpenseSchema } from "@/lib/validation/finance";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listExpenses({ session, requestId });
    return NextResponse.json({ expenses: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "expense.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createExpenseSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    return await withIdempotency(req, session.user.id, "expenses.create", async () => {
      const expense = await createExpense(
        { session, requestId, actorIp: getClientIp(req) },
        parsed.data,
      );
      return { status: 201, body: { expense } };
    });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "expense.write",
    });
  }
}
