import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updateOrganizationSchema } from "@/lib/validation/entities";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (session.user.role !== "admin" && session.user.organizationId !== id) {
    return jsonError("Forbidden", 403);
  }

  const [organization] = await getDb().select().from(organizations).where(eq(organizations.id, id)).limit(1);
  if (!organization) return jsonError("Organization not found", 404);

  return NextResponse.json({ organization });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (session.user.role !== "admin" && session.user.organizationId !== id) {
    return jsonError("Forbidden", 403);
  }

  const parsed = updateOrganizationSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [organization] = await getDb()
    .update(organizations)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  if (!organization) return jsonError("Organization not found", 404);
  return NextResponse.json({ organization });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(organizations).where(eq(organizations.id, id));
  return NextResponse.json({ success: true });
}

