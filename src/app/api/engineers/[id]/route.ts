import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { engineers } from "@/db/schema";
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
import { updateEngineerSchema } from "@/lib/validation/entities";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await context.params;
  const isAdmin = session?.user.role === "admin";

  const [engineer] = await getDb()
    .select()
    .from(engineers)
    .where(
      isAdmin
        ? eq(engineers.id, id)
        : and(eq(engineers.id, id), eq(engineers.isPublic, true), eq(engineers.verified, true)),
    )
    .limit(1);

  if (!engineer) return jsonError("Engineer not found", 404);

  if (isAdmin) return NextResponse.json({ engineer });

  return NextResponse.json({ engineer: omitUserId(engineer) });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(engineers).where(eq(engineers.id, id)).limit(1);
  if (!existing) return jsonError("Engineer not found", 404);

  const isSelf = session.user.engineerId === id;
  if (session.user.role !== "admin" && !isSelf) return jsonError("Forbidden", 403);

  const parsed = updateEngineerSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (session.user.role === "admin") {
      await authorize(session, "talent.engineer.write");
    }

    const [engineer] = await getDb()
      .update(engineers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(engineers.id, id))
      .returning();

    return NextResponse.json({ engineer });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "talent",
      action: "engineer.write",
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
    await authorize(session, "talent.engineer.write");

    await getDb().delete(engineers).where(eq(engineers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "talent",
      action: "engineer.write",
    });
  }
}

function omitUserId<T extends { userId: unknown }>(engineer: T) {
  const safeEngineer = { ...engineer };
  delete safeEngineer.userId;
  return safeEngineer;
}
