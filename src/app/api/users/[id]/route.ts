import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson } from "@/lib/api/responses";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  avatarUrl: z.string().trim().url().optional().nullable(),
  status: z.enum(["active", "invited", "disabled"]).optional(),
  role: z.enum(["admin", "client", "developer"]).optional(),
  organizationId: z.string().uuid().optional().nullable(),
  engineerId: z.string().uuid().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (session.user.role !== "admin" && session.user.id !== id) {
    return jsonError("Forbidden", 403);
  }

  const [user] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return jsonError("User not found", 404);

  return NextResponse.json({ user: omitPasswordHash(user) });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (session.user.role !== "admin" && session.user.id !== id) {
    return jsonError("Forbidden", 403);
  }

  const parsed = updateUserSchema.safeParse(await parseJson(req));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");

  const update =
    session.user.role === "admin"
      ? parsed.data
      : { name: parsed.data.name, avatarUrl: parsed.data.avatarUrl };

  const [user] = await getDb()
    .update(users)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (!user) return jsonError("User not found", 404);

  return NextResponse.json({ user: omitPasswordHash(user) });
}

function omitPasswordHash<T extends { passwordHash: unknown }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}
