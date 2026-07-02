import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { jobRuns } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";

/** Background job liveness/history (Part 9: "job liveness via job_runs"). */
export async function listJobRuns(ctx: CallerContext, limit = 50) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view job run history.");
  }
  await authorize(ctx.session, "platform.job.read");

  return getDb().select().from(jobRuns).orderBy(desc(jobRuns.startedAt)).limit(limit);
}
