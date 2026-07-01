import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, briefs } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updateBriefSchema } from "@/lib/validation/entities";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const [brief] = await getDb().select().from(briefs).where(eq(briefs.id, id)).limit(1);
  if (!brief) return jsonError("Brief not found", 404);

  if (session.user.role !== "admin" && session.user.organizationId !== brief.organizationId) {
    return jsonError("Forbidden", 403);
  }

  return NextResponse.json({ brief });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(briefs).where(eq(briefs.id, id)).limit(1);
  if (!existing) return jsonError("Brief not found", 404);

  if (session.user.role !== "admin" && session.user.organizationId !== existing.organizationId) {
    return jsonError("Forbidden", 403);
  }

  const parsed = updateBriefSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  // Narrow union by existing briefType before accessing variant-specific fields.
  // Clients can only update the narrative/scope fields on either brief type.
  let update: Record<string, unknown>;

  if (session.user.role === "admin") {
    update = parsed.data;
  } else if (existing.briefType === "build") {
    // Safe: cast to build partial since briefType discriminates the union
    const d = parsed.data as {
      problemStatement?: string;
      projectBudget?: string;
      projectTimeline?: string;
      buildStackPreferences?: string[];
    };
    update = {
      problemStatement: d.problemStatement,
      projectBudget: d.projectBudget,
      projectTimeline: d.projectTimeline,
      buildStackPreferences: d.buildStackPreferences,
    };
  } else {
    // Hire brief - narrow to hire partial fields
    const d = parsed.data as {
      description?: string;
      timeline?: string;
      stackTags?: string[];
      engagementModel?: string;
    };
    update = {
      description: d.description,
      timeline: d.timeline,
      stackTags: d.stackTags,
      engagementModel: d.engagementModel,
    };
  }

  const [brief] = await getDb()
    .update(briefs)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(briefs.id, id))
    .returning();

  return NextResponse.json({ brief });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(briefs).where(eq(briefs.id, id));

  await getDb()
    .insert(activityEvents)
    .values({
      type: "brief_deleted",
      actorId: session.user.id,
      actorRole: session.user.role,
      entityType: "brief",
      entityId: id,
      description: `Brief ${id} deleted`,
      visibleTo: ["admin"],
    });

  return NextResponse.json({ success: true });
}
