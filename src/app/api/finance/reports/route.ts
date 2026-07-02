import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  validationError,
} from "@/lib/api/responses";
import {
  getFinanceSummary,
  getMonthToDateSummary,
  getYearToDateSummary,
} from "@/lib/services/finance/reports";
import { financeReportQuerySchema } from "@/lib/validation/finance";

/**
 * GET /api/finance/reports - company-wide revenue/cost/margin/AR/DSO.
 * ?period=mtd|ytd for the two standard windows, or ?from=&to= for a
 * custom one; omit all three for all-time.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");

  try {
    if (period === "mtd") {
      return NextResponse.json(await getMonthToDateSummary({ session, requestId }));
    }
    if (period === "ytd") {
      return NextResponse.json(await getYearToDateSummary({ session, requestId }));
    }

    const parsed = financeReportQuerySchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    if (!parsed.success) return validationError(parsed.error);

    const summary = await getFinanceSummary(
      { session, requestId },
      {
        from: parsed.data.from ? new Date(parsed.data.from) : undefined,
        to: parsed.data.to ? new Date(parsed.data.to) : undefined,
      },
    );
    return NextResponse.json(summary);
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "finance",
      action: "report.export",
    });
  }
}
