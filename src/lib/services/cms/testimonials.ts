import { and, asc, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { testimonials } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createTestimonialSchema, updateTestimonialSchema } from "@/lib/validation/cms";

type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;

/** Public, unauthenticated: only active testimonials, optionally featured-only. */
export async function listPublicTestimonials(filters: { featuredOnly?: boolean } = {}) {
  const conditions = [eq(testimonials.status, "active")];
  if (filters.featuredOnly) conditions.push(eq(testimonials.featured, true));

  return getDb()
    .select()
    .from(testimonials)
    .where(and(...conditions))
    .orderBy(asc(testimonials.order), desc(testimonials.createdAt));
}

/** Staff management view - all testimonials regardless of status, gated by cms.testimonial.write. */
export async function listAllTestimonials(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage testimonials.");
  }
  await authorize(session, "cms.testimonial.write");

  return getDb()
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.order), desc(testimonials.createdAt));
}

export async function createTestimonial(ctx: CallerContext, input: CreateTestimonialInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create testimonials.");
  }
  await authorize(session, "cms.testimonial.write");

  return getDb().transaction(async (tx) => {
    const [testimonial] = await tx.insert(testimonials).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.testimonial.write",
        resourceType: "testimonial",
        resourceId: testimonial.id,
        after: testimonial,
        requestId,
      },
      tx,
    );

    return testimonial;
  });
}

export async function updateTestimonial(
  ctx: CallerContext,
  id: string,
  input: UpdateTestimonialInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit testimonials.");
  }
  await authorize(session, "cms.testimonial.write");

  const [existing] = await getDb()
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Testimonial not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(testimonials)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.testimonial.write",
        resourceType: "testimonial",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function deleteTestimonial(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can delete testimonials.");
  }
  await authorize(session, "cms.testimonial.write");

  const [existing] = await getDb()
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Testimonial not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(testimonials).where(eq(testimonials.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.testimonial.write",
        resourceType: "testimonial",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
