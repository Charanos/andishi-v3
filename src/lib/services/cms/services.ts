import { and, asc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { servicesContent } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { recordRevision } from "@/lib/services/cms/revisions";
import type { CallerContext } from "@/lib/services/types";
import type { createServiceContentSchema, updateServiceContentSchema } from "@/lib/validation/cms";

type CreateServiceContentInput = z.infer<typeof createServiceContentSchema>;
type UpdateServiceContentInput = z.infer<typeof updateServiceContentSchema>;

/** Public, unauthenticated: only published service lines, in display order. */
export async function listPublicServices() {
  return getDb()
    .select()
    .from(servicesContent)
    .where(eq(servicesContent.published, true))
    .orderBy(asc(servicesContent.order));
}

/** Public, unauthenticated: a single published service by slug. */
export async function getPublicServiceBySlug(slug: string) {
  const [service] = await getDb()
    .select()
    .from(servicesContent)
    .where(and(eq(servicesContent.slug, slug), eq(servicesContent.published, true)))
    .limit(1);

  return service ?? null;
}

/** Staff management view - all entries regardless of publish state, gated by cms.service.write. */
export async function listAllServices(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage services content.");
  }
  await authorize(session, "cms.service.write");

  return getDb().select().from(servicesContent).orderBy(asc(servicesContent.order));
}

export async function createService(ctx: CallerContext, input: CreateServiceContentInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create services content.");
  }
  await authorize(session, "cms.service.write");

  const [existing] = await getDb()
    .select({ id: servicesContent.id })
    .from(servicesContent)
    .where(eq(servicesContent.slug, input.slug))
    .limit(1);
  if (existing) throw new ConflictError("Services content for this slug already exists.");

  return getDb().transaction(async (tx) => {
    const [service] = await tx.insert(servicesContent).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.service.write",
        resourceType: "services_content",
        resourceId: service.id,
        after: service,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "services_content",
      contentId: service.id,
      snapshot: service,
      editorUserId: session.user.id,
    });

    return service;
  });
}

export async function updateService(
  ctx: CallerContext,
  id: string,
  input: UpdateServiceContentInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit services content.");
  }
  await authorize(session, "cms.service.write");

  const [existing] = await getDb()
    .select()
    .from(servicesContent)
    .where(eq(servicesContent.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Services content not found.");

  if (input.slug && input.slug !== existing.slug) {
    const [slugTaken] = await getDb()
      .select({ id: servicesContent.id })
      .from(servicesContent)
      .where(eq(servicesContent.slug, input.slug))
      .limit(1);
    if (slugTaken) throw new ConflictError("Services content for this slug already exists.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(servicesContent)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(servicesContent.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.service.write",
        resourceType: "services_content",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "services_content",
      contentId: updated.id,
      snapshot: updated,
      editorUserId: session.user.id,
    });

    return updated;
  });
}

export async function deleteService(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can delete services content.");
  }
  await authorize(session, "cms.service.write");

  const [existing] = await getDb()
    .select()
    .from(servicesContent)
    .where(eq(servicesContent.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Services content not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(servicesContent).where(eq(servicesContent.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.service.write",
        resourceType: "services_content",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
