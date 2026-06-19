import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { briefs, matches } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updateMatchSchema } from "@/lib/validation/entities";

async function canAccessMatch(matchId: string) {
  const session = await getSession();
  if (!session) return { session: null, match: null, allowed: false };

  const [row] = await getDb()
    .select({ match: matches, brief: briefs })
    .from(matches)
    .innerJoin(briefs, eq(matches.briefId, briefs.id))
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!row) return { session, match: null, allowed: false };

  const allowed =
    session.user.role === "admin" ||
    session.user.engineerId === row.match.engineerId ||
    session.user.organizationId === row.brief.organizationId;

  return { session, match: row.match, allowed };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, match, allowed } = await canAccessMatch(id);

  if (!session) return jsonError("Unauthorized", 401);
  if (!match) return jsonError("Match not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  return NextResponse.json({ match });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, match, allowed } = await canAccessMatch(id);

  if (!session) return jsonError("Unauthorized", 401);
  if (!match) return jsonError("Match not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  const parsed = updateMatchSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const clientAllowed = {
    status: parsed.data.status,
    clientNotes: parsed.data.clientNotes,
    clientPreferredSlot1: parsed.data.clientPreferredSlot1,
    clientPreferredSlot2: parsed.data.clientPreferredSlot2,
  };

  const update = session.user.role === "admin" ? parsed.data : clientAllowed;
  const [updated] = await getDb()
    .update(matches)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(matches.id, id))
    .returning();

  return NextResponse.json({ match: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(matches).where(eq(matches.id, id));
  return NextResponse.json({ success: true });
}

