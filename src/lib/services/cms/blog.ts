import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createBlogPostSchema, updateBlogPostSchema } from "@/lib/validation/cms";

type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

/** Public, unauthenticated: only published posts, newest first. */
export async function listPublicBlogPosts(filters: { category?: string } = {}) {
  const conditions = [eq(blogPosts.status, "published")];
  if (filters.category && filters.category !== "All") {
    conditions.push(
      eq(blogPosts.category, filters.category as (typeof blogPosts.category.enumValues)[number]),
    );
  }

  return getDb()
    .select()
    .from(blogPosts)
    .where(and(...conditions))
    .orderBy(desc(blogPosts.datePublished));
}

/** Public, unauthenticated: a single published post by slug. */
export async function getPublicBlogPostBySlug(slug: string) {
  const [post] = await getDb()
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  return post ?? null;
}

/** Staff management view - all posts regardless of status, gated by cms.blog.read. */
export async function listAllBlogPosts(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage blog posts.");
  }
  await authorize(session, "cms.blog.read");

  return getDb().select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function createBlogPost(ctx: CallerContext, input: CreateBlogPostInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create blog posts.");
  }
  await authorize(session, "cms.blog.write");

  const [existing] = await getDb()
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, input.slug))
    .limit(1);
  if (existing) throw new ConflictError("A blog post with this slug already exists.");

  return getDb().transaction(async (tx) => {
    const [post] = await tx
      .insert(blogPosts)
      .values({ ...input, authorUserId: session.user.id })
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.blog.write",
        resourceType: "blog_post",
        resourceId: post.id,
        after: post,
        requestId,
      },
      tx,
    );

    return post;
  });
}

export async function updateBlogPost(ctx: CallerContext, id: string, input: UpdateBlogPostInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit blog posts.");
  }
  await authorize(session, "cms.blog.write");

  const [existing] = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Blog post not found.");

  if (input.slug && input.slug !== existing.slug) {
    const [slugTaken] = await getDb()
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, input.slug))
      .limit(1);
    if (slugTaken) throw new ConflictError("A blog post with this slug already exists.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(blogPosts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.blog.write",
        resourceType: "blog_post",
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

export async function deleteBlogPost(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can delete blog posts.");
  }
  await authorize(session, "cms.blog.write");

  const [existing] = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Blog post not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(blogPosts).where(eq(blogPosts.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.blog.write",
        resourceType: "blog_post",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
