import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timesheetEntries } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createTimesheetSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(timesheetEntries).orderBy(timesheetEntries.createdAt);
    return NextResponse.json({ timesheets: result });
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return NextResponse.json({ timesheets: [] });
    const result = await getDb()
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.engineerId, session.user.engineerId));
    return NextResponse.json({ timesheets: result });
  }

  return NextResponse.json({ timesheets: [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.user.role === "client") return jsonError("Forbidden", 403);

  const parsed = createTimesheetSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const engineerId = session.user.role === "admin" ? parsed.data.engineerId : session.user.engineerId;
  if (!engineerId) return jsonError("engineerId is required.", 400);

  const [timesheet] = await getDb()
    .insert(timesheetEntries)
    .values({ ...parsed.data, engineerId })
    .returning();

  return NextResponse.json({ timesheet }, { status: 201 });
}

