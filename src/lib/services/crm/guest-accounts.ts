import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { getDb } from "@/db";
import { organizations, users } from "@/db/schema";

type Executor = Pick<DB, "insert" | "select">;

/**
 * Find-or-create a guest organization + user by email, keyed the same way
 * across every public intake surface (billingEmail / users.email). Shared
 * by /api/contact (a self-qualifying wizard submission that creates a
 * brief immediately) and convertLeadToBrief (a staff-initiated conversion
 * of a lead that arrived without an org/user yet, e.g. manual/referral/
 * campaign sources) - previously this logic was duplicated inline in the
 * contact route only, with no path for the CRM to create the same shape
 * of account when converting a lead.
 *
 * Security: does NOT leak whether an email already exists - always
 * silently upserts rather than erroring on a match.
 */
export async function findOrCreateGuestAccount(
  input: { email: string; name: string; company?: string | null },
  tx?: Executor,
) {
  const db = tx ?? getDb();
  const email = input.email.toLowerCase();

  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.billingEmail, email))
    .limit(1);

  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({ name: input.company ?? input.name, billingEmail: email })
      .returning();
  }

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email,
        name: input.name,
        role: "client",
        status: "invited",
        emailVerified: false,
        organizationId: org.id,
      })
      .returning();
  }

  return { organization: org, user };
}
