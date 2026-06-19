import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, engineers } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createEngineerSchema } from "@/lib/validation/entities";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const isAdmin = session?.user.role === "admin";
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const availability = searchParams.get("availability");
  const search = searchParams.get("q");
  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(engineers.isPublic, true), eq(engineers.verified, true));
  }

  if (domain && domain !== "all") {
    conditions.push(eq(engineers.domain, domain));
  }

  if (availability === "available" || availability === "soon" || availability === "engaged") {
    conditions.push(eq(engineers.availability, availability));
  }

  if (search) {
    conditions.push(
      or(
        ilike(engineers.name, `%${search}%`),
        ilike(engineers.role, `%${search}%`),
        ilike(engineers.location, `%${search}%`),
      ),
    );
  }

  const result = await getDb()
    .select()
    .from(engineers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(engineers.createdAt);

  const payload = isAdmin ? result : result.map(omitUserId);
  return NextResponse.json({ engineers: payload });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createEngineerSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [engineer] = await getDb().insert(engineers).values(parsed.data).returning();

  await getDb().insert(activityEvents).values({
    type: "engineer_added",
    actorId: session.user.id,
    actorRole: session.user.role,
    entityType: "engineer",
    entityId: engineer.id,
    description: `Engineer ${engineer.name} added to network`,
    visibleTo: ["admin"],
  });

  return NextResponse.json({ engineer }, { status: 201 });
}

function omitUserId<T extends { userId: unknown }>(engineer: T) {
  const safeEngineer = { ...engineer };
  delete safeEngineer.userId;
  return safeEngineer;
}
