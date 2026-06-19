import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { invoices } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { updateInvoiceSchema } from "@/lib/validation/entities";

async function getInvoiceForRequest(id: string) {
  const session = await getSession();
  if (!session) return { session: null, invoice: null, allowed: false };

  const [invoice] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoice) return { session, invoice: null, allowed: false };

  const allowed =
    session.user.role === "admin" ||
    session.user.organizationId === invoice.organizationId ||
    session.user.engineerId === invoice.engineerId;

  return { session, invoice, allowed };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, invoice, allowed } = await getInvoiceForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!invoice) return jsonError("Invoice not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ invoice });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const parsed = updateInvoiceSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const [invoice] = await getDb()
    .update(invoices)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();

  if (!invoice) return jsonError("Invoice not found", 404);
  return NextResponse.json({ invoice });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(invoices).where(eq(invoices.id, id));
  return NextResponse.json({ success: true });
}

