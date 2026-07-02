import { and, asc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { skillDomains } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { recordRevision } from "@/lib/services/cms/revisions";
import type { CallerContext } from "@/lib/services/types";
import type { createSkillDomainSchema, updateSkillDomainSchema } from "@/lib/validation/cms";

type CreateSkillDomainInput = z.infer<typeof createSkillDomainSchema>;
type UpdateSkillDomainInput = z.infer<typeof updateSkillDomainSchema>;

/** Public, unauthenticated: only published domains, in display order. */
export async function listPublicSkillDomains() {
  return getDb()
    .select()
    .from(skillDomains)
    .where(eq(skillDomains.published, true))
    .orderBy(asc(skillDomains.order));
}

/** Public, unauthenticated: a single published domain by slug. */
export async function getPublicSkillDomainBySlug(slug: string) {
  const [domain] = await getDb()
    .select()
    .from(skillDomains)
    .where(and(eq(skillDomains.slug, slug), eq(skillDomains.published, true)))
    .limit(1);

  return domain ?? null;
}

/** Staff management view - all entries regardless of publish state, gated by cms.skill_domain.write. */
export async function listAllSkillDomains(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage skill domains.");
  }
  await authorize(session, "cms.skill_domain.write");

  return getDb().select().from(skillDomains).orderBy(asc(skillDomains.order));
}

export async function createSkillDomain(ctx: CallerContext, input: CreateSkillDomainInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create skill domains.");
  }
  await authorize(session, "cms.skill_domain.write");

  const [existing] = await getDb()
    .select({ id: skillDomains.id })
    .from(skillDomains)
    .where(eq(skillDomains.slug, input.slug))
    .limit(1);
  if (existing) throw new ConflictError("A skill domain with this slug already exists.");

  return getDb().transaction(async (tx) => {
    const [domain] = await tx.insert(skillDomains).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.skill_domain.write",
        resourceType: "skill_domain",
        resourceId: domain.id,
        after: domain,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "skill_domain",
      contentId: domain.id,
      snapshot: domain,
      editorUserId: session.user.id,
    });

    return domain;
  });
}

export async function updateSkillDomain(
  ctx: CallerContext,
  id: string,
  input: UpdateSkillDomainInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit skill domains.");
  }
  await authorize(session, "cms.skill_domain.write");

  const [existing] = await getDb()
    .select()
    .from(skillDomains)
    .where(eq(skillDomains.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Skill domain not found.");

  if (input.slug && input.slug !== existing.slug) {
    const [slugTaken] = await getDb()
      .select({ id: skillDomains.id })
      .from(skillDomains)
      .where(eq(skillDomains.slug, input.slug))
      .limit(1);
    if (slugTaken) throw new ConflictError("A skill domain with this slug already exists.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(skillDomains)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(skillDomains.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.skill_domain.write",
        resourceType: "skill_domain",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "skill_domain",
      contentId: updated.id,
      snapshot: updated,
      editorUserId: session.user.id,
    });

    return updated;
  });
}

export async function deleteSkillDomain(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can delete skill domains.");
  }
  await authorize(session, "cms.skill_domain.write");

  const [existing] = await getDb()
    .select()
    .from(skillDomains)
    .where(eq(skillDomains.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Skill domain not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(skillDomains).where(eq(skillDomains.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.skill_domain.write",
        resourceType: "skill_domain",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
