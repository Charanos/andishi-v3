import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import type { PaginationParams } from "@/lib/api/responses";
import type { CallerContext } from "@/lib/services/types";

/** The immutable audit trail, admin-readable only (Part 10: "Audit log is append-only and admin-readable only"). */
export async function listAuditLog(ctx: CallerContext, pagination: PaginationParams) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view the audit log.");
  }
  await authorize(ctx.session, "platform.audit.read");

  const db = getDb();
  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(pagination.pageSize)
      .offset(pagination.offset),
    db.select({ count: sql<number>`count(*)` }).from(auditLog),
  ]);

  return { rows, total: Number(count) };
}
