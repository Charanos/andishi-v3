import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import { generateRequestId, handleRouteError, jsonError, parseJson } from "@/lib/api/responses";
import { z } from "zod";

const reorderSchema = z.object({
  field: z.enum(["approachSteps", "solutionHighlights", "gallery"]),
  items: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

/**
 * PATCH /api/work/manage/[id]/reorder
 *
 * Admin-only. Reorders items in a JSONB array (approachSteps, solutionHighlights, or gallery).
 * Expects a payload: { field: "gallery", items: [{ id: "img-123", order: 0 }, { id: "img-456", order: 1 }] }
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Case study not found", 404);

  const body = await parseJson(req);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid reorder payload", 400);

  try {
    await authorize(session, "delivery.project.write");
    const { field, items } = parsed.data;

    // Merge the new orders into the existing JSONB array
    const existingArray = (existing[field] as { id: string; order?: number }[]) || [];
    const updatedArray = existingArray.map((item) => {
      const match = items.find((i) => i.id === item.id);
      return match ? { ...item, order: match.order } : item;
    });

    // Sort by order so the DB stores them predictably
    updatedArray.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const [updated] = await getDb()
      .update(projects)
      .set({
        [field]: updatedArray,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id, updatedAt: projects.updatedAt });

    return NextResponse.json({ project: updated });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.write",
    });
  }
}
