import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, briefs, matches } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { createMatchSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(matches).orderBy(matches.createdAt);
    return NextResponse.json({ matches: result });
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return NextResponse.json({ matches: [] });
    const result = await getDb()
      .select()
      .from(matches)
      .where(eq(matches.engineerId, session.user.engineerId))
      .orderBy(matches.createdAt);
    return NextResponse.json({ matches: result });
  }

  if (!session.user.organizationId) return NextResponse.json({ matches: [] });
  const result = await getDb()
    .select({ match: matches })
    .from(matches)
    .innerJoin(briefs, eq(matches.briefId, briefs.id))
    .where(eq(briefs.organizationId, session.user.organizationId))
    .orderBy(matches.createdAt);

  return NextResponse.json({ matches: result.map((row) => row.match) });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createMatchSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    await authorize(session, "delivery.match.write");

    const [match] = await getDb().insert(matches).values(parsed.data).returning();

    await getDb()
      .insert(activityEvents)
      .values({
        type: "match_proposed",
        actorId: session.user.id,
        actorRole: session.user.role,
        engineerId: match.engineerId,
        entityType: "match",
        entityId: match.id,
        description: "Engineer match proposed",
        visibleTo: ["admin", "client"],
      });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "match.write",
    });
  }
}
