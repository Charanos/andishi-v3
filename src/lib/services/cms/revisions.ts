import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "@/db";
import { getDb } from "@/db";
import { contentRevisions } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import type { PermissionKey } from "@/lib/authz/catalog";
import { ForbiddenError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { contentTypeEnum } from "@/lib/validation/cms";

export type ContentType = z.infer<typeof contentTypeEnum>;

/** Either the top-level DB client or a transaction handle - see lib/authz/audit.ts. */
type Executor = Pick<DB, "insert">;

const REVISION_PERMISSION: Record<ContentType, PermissionKey> = {
  services_content: "cms.service.write",
  skill_domain: "cms.skill_domain.write",
  faq: "cms.faq.write",
  blog_post: "cms.blog.write",
  testimonial: "cms.testimonial.write",
};

/**
 * Appends a revision snapshot. Called from every CMS create/update so
 * "history" for a piece of content is: its current live row, plus every
 * revision here ordered by createdAt.
 */
export async function recordRevision(
  tx: Executor,
  params: {
    contentType: ContentType;
    contentId: string;
    snapshot: unknown;
    editorUserId: string;
  },
) {
  await tx.insert(contentRevisions).values({
    contentType: params.contentType,
    contentId: params.contentId,
    snapshot: params.snapshot,
    editorUserId: params.editorUserId,
  });
}

export async function listContentRevisions(
  ctx: CallerContext,
  contentType: ContentType,
  contentId: string,
) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view content revision history.");
  }
  await authorize(session, REVISION_PERMISSION[contentType]);

  return getDb()
    .select()
    .from(contentRevisions)
    .where(
      and(eq(contentRevisions.contentType, contentType), eq(contentRevisions.contentId, contentId)),
    )
    .orderBy(desc(contentRevisions.createdAt));
}
