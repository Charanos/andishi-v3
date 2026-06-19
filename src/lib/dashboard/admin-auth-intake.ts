import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export type AdminAuthIntakeRecord = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client" | "developer";
  status: "active" | "invited" | "disabled";
  emailVerified: boolean;
  organizationId: string | null;
  engineerId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export async function getAdminAuthIntake(limit = 12): Promise<AdminAuthIntakeRecord[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      organizationId: users.organizationId,
      engineerId: users.engineerId,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  }));
}
