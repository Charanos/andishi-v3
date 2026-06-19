import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timesheetEntries } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updateTimesheetSchema } from "@/lib/validation/entities";

async function getTimesheetForRequest(id: string) {
  const session = await getSession();
  if (!session) return { session: null, timesheet: null, allowed: false };

  const [timesheet] = await getDb()
    .select()
    .from(timesheetEntries)
    .where(eq(timesheetEntries.id, id))
    .limit(1);

  if (!timesheet) return { session, timesheet: null, allowed: false };

  const allowed = session.user.role === "admin" || session.user.engineerId === timesheet.engineerId;
  return { session, timesheet, allowed };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, timesheet, allowed } = await getTimesheetForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!timesheet) return jsonError("Timesheet not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ timesheet });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, timesheet, allowed } = await getTimesheetForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!timesheet) return jsonError("Timesheet not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  const parsed = updateTimesheetSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const update = session.user.role === "admin" ? parsed.data : { ...parsed.data, engineerId: timesheet.engineerId };
  const [updated] = await getDb()
    .update(timesheetEntries)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(timesheetEntries.id, id))
    .returning();

  return NextResponse.json({ timesheet: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, timesheet, allowed } = await getTimesheetForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!timesheet) return jsonError("Timesheet not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  await getDb().delete(timesheetEntries).where(eq(timesheetEntries.id, id));
  return NextResponse.json({ success: true });
}

