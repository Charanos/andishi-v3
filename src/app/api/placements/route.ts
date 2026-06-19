import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { placements } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createPlacementSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(placements).orderBy(placements.createdAt);
    return NextResponse.json({ placements: result });
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return NextResponse.json({ placements: [] });
    const result = await getDb()
      .select()
      .from(placements)
      .where(eq(placements.engineerId, session.user.engineerId));
    return NextResponse.json({ placements: result });
  }

  if (!session.user.organizationId) return NextResponse.json({ placements: [] });
  const result = await getDb()
    .select()
    .from(placements)
    .where(eq(placements.organizationId, session.user.organizationId));

  return NextResponse.json({ placements: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createPlacementSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [placement] = await getDb().insert(placements).values(parsed.data).returning();
  return NextResponse.json({ placement }, { status: 201 });
}

