import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createOrganizationSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(organizations).orderBy(organizations.createdAt);
    return NextResponse.json({ organizations: result });
  }

  if (!session.user.organizationId) {
    return NextResponse.json({ organizations: [] });
  }

  const result = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.user.organizationId));

  return NextResponse.json({ organizations: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createOrganizationSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [organization] = await getDb().insert(organizations).values(parsed.data).returning();
  return NextResponse.json({ organization }, { status: 201 });
}

