import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { governanceControls } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  createGovernanceControlSchema,
  updateGovernanceControlSchema,
} from "@/lib/validation/governance";

type CreateGovernanceControlInput = z.infer<typeof createGovernanceControlSchema>;
type UpdateGovernanceControlInput = z.infer<typeof updateGovernanceControlSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listGovernanceControls(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view governance controls.");
  await authorize(ctx.session, "platform.governance.read");

  return getDb().select().from(governanceControls).orderBy(desc(governanceControls.updatedAt));
}

export async function createGovernanceControl(
  ctx: CallerContext,
  input: CreateGovernanceControlInput,
) {
  assertStaff(ctx, "Only Andishi staff can create governance controls.");
  await authorize(ctx.session, "platform.governance.write");

  return getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(governanceControls)
      .values({
        ...input,
        createdBy: ctx.session.user.id,
        updatedBy: ctx.session.user.id,
      })
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "platform.governance.write",
        resourceType: "governance_control",
        resourceId: created.id,
        before: null,
        after: created,
        requestId: ctx.requestId,
      },
      tx,
    );

    return created;
  });
}

export async function updateGovernanceControl(
  ctx: CallerContext,
  id: string,
  input: UpdateGovernanceControlInput,
) {
  assertStaff(ctx, "Only Andishi staff can update governance controls.");
  await authorize(ctx.session, "platform.governance.write");

  const [existing] = await getDb()
    .select()
    .from(governanceControls)
    .where(eq(governanceControls.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Governance control not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(governanceControls)
      .set({ ...input, updatedBy: ctx.session.user.id, updatedAt: new Date() })
      .where(eq(governanceControls.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "platform.governance.write",
        resourceType: "governance_control",
        resourceId: id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function archiveGovernanceControl(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can archive governance controls.");
  await authorize(ctx.session, "platform.governance.write");

  const [existing] = await getDb()
    .select()
    .from(governanceControls)
    .where(eq(governanceControls.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Governance control not found.");

  return getDb().transaction(async (tx) => {
    await tx.delete(governanceControls).where(eq(governanceControls.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "platform.governance.write",
        resourceType: "governance_control",
        resourceId: id,
        before: existing,
        after: null,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
