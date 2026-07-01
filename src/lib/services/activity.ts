import type { DB } from "@/db";
import { getDb } from "@/db";
import { activityEvents, type NewActivityEvent } from "@/db/schema";
import type { PermissionKey } from "@/lib/authz/catalog";

/**
 * Three-tier visibility model for activity_events.visibleTo (see
 * ADR-0007 for the full reasoning):
 *
 * - "client" / "developer": ownership-based - the owning organization's
 *   users / the assigned engineer, resolved by organizationId/engineerId
 *   match, not by permission.
 * - "admin": broadly visible to any staff member regardless of their
 *   specific role - use for events genuinely relevant company-wide.
 * - a PermissionKey (e.g. "finance.invoice.read"): visible only to staff
 *   holding that exact permission - use this for department-specific
 *   handoffs so the activity feed respects the same boundaries as `can()`.
 */
export type ActivityVisibility = "admin" | "client" | "developer" | PermissionKey;

export interface EmitActivityEventInput
  extends Omit<NewActivityEvent, "visibleTo" | "id" | "createdAt"> {
  visibleTo: ActivityVisibility[];
}

type Executor = Pick<DB, "insert">;

/**
 * Single insertion point for activity_events. Prefer this over inserting
 * directly so visibility stays typed and consistent with the resolver in
 * src/app/api/activity/route.ts.
 */
export async function emitActivityEvent(
  input: EmitActivityEventInput,
  tx?: Executor,
): Promise<void> {
  const db = tx ?? getDb();
  await db.insert(activityEvents).values(input);
}
