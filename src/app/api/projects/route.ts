import { NextRequest, NextResponse } from "next/server";
import { arrayContains, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createProjectSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(projects).orderBy(projects.createdAt);
    return NextResponse.json({ projects: result });
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return NextResponse.json({ projects: [] });
    const result = await getDb()
      .select()
      .from(projects)
      .where(arrayContains(projects.engineerIds, [session.user.engineerId]));
    return NextResponse.json({ projects: result });
  }

  if (!session.user.organizationId) return NextResponse.json({ projects: [] });
  const result = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.organizationId, session.user.organizationId));

  return NextResponse.json({ projects: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createProjectSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [project] = await getDb().insert(projects).values(parsed.data).returning();
  return NextResponse.json({ project }, { status: 201 });
}

