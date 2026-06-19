import { NextResponse } from "next/server";
import { or, eq, arrayContains } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const events = await getDb().select().from(activityEvents).orderBy(activityEvents.createdAt).limit(50);
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

