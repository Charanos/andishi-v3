import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { invoices } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createInvoiceSchema } from "@/lib/validation/entities";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (session.user.role === "admin") {
    const result = await getDb().select().from(invoices).orderBy(invoices.createdAt);
    return NextResponse.json({ invoices: result });
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return NextResponse.json({ invoices: [] });
    const result = await getDb().select().from(invoices).where(eq(invoices.engineerId, session.user.engineerId));
    return NextResponse.json({ invoices: result });
  }

  if (!session.user.organizationId) return NextResponse.json({ invoices: [] });
  const result = await getDb().select().from(invoices).where(eq(invoices.organizationId, session.user.organizationId));
  return NextResponse.json({ invoices: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createInvoiceSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [invoice] = await getDb().insert(invoices).values(parsed.data).returning();
  return NextResponse.json({ invoice }, { status: 201 });
}

