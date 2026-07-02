import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { engineers, vettingStages } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { recordVettingDecisionSchema } from "@/lib/validation/talent";

type RecordVettingDecisionInput = z.infer<typeof recordVettingDecisionSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listVettingStages(ctx: CallerContext, engineerId: string) {
  assertStaff(ctx, "Only Andishi staff can view vetting history.");
  await authorize(ctx.session, "talent.vetting.read");

  return getDb()
    .select()
    .from(vettingStages)
    .where(eq(vettingStages.engineerId, engineerId))
    .orderBy(desc(vettingStages.createdAt));
}

/**
 * Records a stage decision and rolls it up onto engineers.vettingStatus:
 * a failure at ANY stage ends the pipeline (failed); passing the final
 * stage marks the engineer passed overall. Mid-pipeline passes just keep
 * the engineer "in_progress" - only the terminal outcomes change status.
 */
export async function recordVettingDecision(
  ctx: CallerContext,
  engineerId: string,
  input: RecordVettingDecisionInput,
) {
  assertStaff(ctx, "Only Andishi staff can record vetting decisions.");
  await authorize(ctx.session, "talent.vetting.write");

  const [engineer] = await getDb()
    .select()
    .from(engineers)
    .where(eq(engineers.id, engineerId))
    .limit(1);
  if (!engineer) throw new NotFoundError("Engineer not found.");

  return getDb().transaction(async (tx) => {
    const [stage] = await tx
      .insert(vettingStages)
      .values({
        engineerId,
        stage: input.stage,
        status: input.status,
        reviewerUserId: ctx.session.user.id,
        notes: input.notes,
        decidedAt: input.status === "pending" ? null : new Date(),
      })
      .returning();

    let nextVettingStatus = engineer.vettingStatus;
    if (input.status === "failed") {
      nextVettingStatus = "failed";
    } else if (input.status === "passed" && input.stage === "final_decision") {
      nextVettingStatus = "passed";
    } else if (engineer.vettingStatus === "not_started") {
      nextVettingStatus = "in_progress";
    }

    if (nextVettingStatus !== engineer.vettingStatus) {
      await tx
        .update(engineers)
        .set({ vettingStatus: nextVettingStatus, updatedAt: new Date() })
        .where(eq(engineers.id, engineerId));

      if (nextVettingStatus === "passed" || nextVettingStatus === "failed") {
        await emitActivityEvent(
          {
            type:
              nextVettingStatus === "passed"
                ? "engineer_vetting_passed"
                : "engineer_vetting_failed",
            actorId: ctx.session.user.id,
            actorRole: ctx.session.user.role,
            engineerId,
            entityType: "engineer",
            entityId: engineerId,
            description: `${engineer.name}'s vetting ${nextVettingStatus === "passed" ? "passed" : "failed"} at ${input.stage}`,
            visibleTo: ["admin"],
          },
          tx,
        );
      }
    }

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "talent.vetting.write",
        resourceType: "vetting_stage",
        resourceId: stage.id,
        after: { ...stage, rolledUpVettingStatus: nextVettingStatus },
        requestId: ctx.requestId,
      },
      tx,
    );

    return stage;
  });
}
