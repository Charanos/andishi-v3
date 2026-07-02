import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { placements } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
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

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { session, placement, allowed } = await getPlacementForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!placement) return jsonError("Placement not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ placement });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = updatePlacementSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (session.user.role !== "admin") throw new ForbiddenError();
    await authorize(session, "delivery.placement.write");

    const [placement] = await getDb()
      .update(placements)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(placements.id, id))
      .returning();

    if (!placement) return jsonError("Placement not found", 404);
    return NextResponse.json({ placement });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "placement.write",
    });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    if (session.user.role !== "admin") throw new ForbiddenError();
    await authorize(session, "delivery.placement.write");

    await getDb().delete(placements).where(eq(placements.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "placement.write",
    });
  }
}
