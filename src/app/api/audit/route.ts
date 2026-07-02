import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  paginated,
  parsePagination,
} from "@/lib/api/responses";
import { listAuditLog } from "@/lib/services/platform/audit";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const pagination = parsePagination(searchParams);

  try {
    const { rows, total } = await listAuditLog({ session, requestId }, pagination);
    return paginated(rows, pagination, total);
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "audit.read",
    });
  }
}
