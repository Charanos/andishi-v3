import type { DB } from "@/db";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";

/**
 * Accepts either the top-level DB client or a transaction handle from
 * db.transaction(async (tx) => ...) - both expose the same `.insert()`
 * builder, they just aren't the same nominal type.
 */
type Executor = Pick<DB, "insert">;

export interface WriteAuditInput {
  actorUserId?: string | null;
  actorIp?: string | null;
  /** Usually the permission key exercised, e.g. "delivery.task.write". */
  action: string;
  resourceType: string;
  resourceId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  requestId?: string | null;
}

/**
 * Writes one immutable audit_log row. Called by services for every
 * write/delete/approve, inside the same transaction as the mutation itself
 * (pass `tx` so the audit entry only lands if the mutation commits).
 */
export async function writeAudit(input: WriteAuditInput, tx?: Executor): Promise<void> {
  const db = tx ?? getDb();

  await db.insert(auditLog).values({
    actorUserId: input.actorUserId ?? null,
    actorIp: input.actorIp ?? null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    requestId: input.requestId ?? null,
  });
}
