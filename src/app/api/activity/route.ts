import { NextResponse } from "next/server";
import { or, eq, arrayContains } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";
import { resolveActorPermissions } from "@/lib/authz/resolve";

/**
 * Staff (admin-persona) visibility is resolved through the same
 * resolveActorPermissions() used by can()/authorize() - a finance_manager
 * and a recruiter see different activity, matching the same boundaries
 * that gate their API access (see ADR-0007). "admin" is a broad tag any
 * staff member can see regardless of specific role; a permission key
 * (e.g. "finance.invoice.read") is visible only to staff holding it.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const grants = await resolveActorPermissions(session.user.id);
    const visibilityTags = ["admin", ...grants.global];
    const conditions = visibilityTags.map((tag) => arrayContains(activityEvents.visibleTo, [tag]));

    const events = await getDb()
      .select()
      .from(activityEvents)
      .where(or(...conditions))
      .orderBy(activityEvents.createdAt)
      .limit(50);

    return NextResponse.json({ activity: events });
  }

  const conditions = [arrayContains(activityEvents.visibleTo, [session.user.role])];
  if (session.user.organizationId) {
    conditions.push(eq(activityEvents.organizationId, session.user.organizationId));
  }
  if (session.user.engineerId) {
    conditions.push(eq(activityEvents.engineerId, session.user.engineerId));
  }

  const events = await getDb()
    .select()
    .from(activityEvents)
    .where(or(...conditions))
    .orderBy(activityEvents.createdAt)
    .limit(50);

  return NextResponse.json({ activity: events });
}
