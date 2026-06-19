import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { placements } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updatePlacementSchema } from "@/lib/validation/entities";

async function getPlacementForRequest(id: string) {
  const session = await getSession();
  if (!session) return { session: null, placement: null, allowed: false };

  const [placement] = await getDb().select().from(placements).where(eq(placements.id, id)).limit(1);
  if (!placement) return { session, placement: null, allowed: false };

  const allowed =
    session.user.role === "admin" ||
    session.user.organizationId === placement.organizationId ||
    session.user.engineerId === placement.engineerId;

  return { session, placement, allowed };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, placement, allowed } = await getPlacementForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!placement) return jsonError("Placement not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ placement });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const parsed = updatePlacementSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [placement] = await getDb()
    .update(placements)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(placements.id, id))
    .returning();

  if (!placement) return jsonError("Placement not found", 404);
  return NextResponse.json({ placement });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(placements).where(eq(placements.id, id));
  return NextResponse.json({ success: true });
}

