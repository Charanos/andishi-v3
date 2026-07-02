import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { engineerSkills, skills } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  createSkillSchema,
  setEngineerSkillSchema,
  updateSkillSchema,
} from "@/lib/validation/talent";

type CreateSkillInput = z.infer<typeof createSkillSchema>;
type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
type SetEngineerSkillInput = z.infer<typeof setEngineerSkillSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

/** Public-ish read: the taxonomy itself isn't sensitive, but reads still go through staff for now (no public skills browser yet). */
export async function listSkills(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view the skills taxonomy.");
  await authorize(ctx.session, "talent.skill.read");

  return getDb().select().from(skills).orderBy(skills.category, skills.name);
}

export async function createSkill(ctx: CallerContext, input: CreateSkillInput) {
  assertStaff(ctx, "Only Andishi staff can manage the skills taxonomy.");
  await authorize(ctx.session, "talent.skill.write");

  const [existing] = await getDb()
    .select()
    .from(skills)
    .where(eq(skills.slug, input.slug))
    .limit(1);
  if (existing) throw new ConflictError("A skill with this slug already exists.");

  return getDb().transaction(async (tx) => {
    const [skill] = await tx.insert(skills).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "talent.skill.write",
        resourceType: "skill",
        resourceId: skill.id,
        after: skill,
        requestId: ctx.requestId,
      },
      tx,
    );

    return skill;
  });
}

export async function updateSkill(ctx: CallerContext, id: string, input: UpdateSkillInput) {
  assertStaff(ctx, "Only Andishi staff can manage the skills taxonomy.");
  await authorize(ctx.session, "talent.skill.write");

  const [existing] = await getDb().select().from(skills).where(eq(skills.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Skill not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx.update(skills).set(input).where(eq(skills.id, id)).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "talent.skill.write",
        resourceType: "skill",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function deleteSkill(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can manage the skills taxonomy.");
  await authorize(ctx.session, "talent.skill.write");

  const [existing] = await getDb().select().from(skills).where(eq(skills.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Skill not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(engineerSkills).where(eq(engineerSkills.skillId, id));
    await tx.delete(skills).where(eq(skills.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "talent.skill.write",
        resourceType: "skill",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}

/** Engineer's own profile OR staff with talent.engineer.write can view/set skill mappings. */
function assertCanManageEngineerSkills(ctx: CallerContext, engineerId: string) {
  const isSelf =
    ctx.session.user.role === "developer" && ctx.session.user.engineerId === engineerId;
  if (!isSelf && ctx.session.user.role !== "admin") {
    throw new ForbiddenError("You can only manage your own skills.");
  }
  return isSelf;
}

export async function listEngineerSkills(ctx: CallerContext, engineerId: string) {
  const isSelf =
    ctx.session.user.role === "developer" && ctx.session.user.engineerId === engineerId;
  if (!isSelf && ctx.session.user.role === "admin") {
    await authorize(ctx.session, "talent.engineer.read");
  } else if (!isSelf) {
    throw new ForbiddenError("You can only view your own skills.");
  }

  return getDb()
    .select({ engineerSkill: engineerSkills, skill: skills })
    .from(engineerSkills)
    .innerJoin(skills, eq(engineerSkills.skillId, skills.id))
    .where(eq(engineerSkills.engineerId, engineerId));
}

/** Upsert - an engineer (or staff on their behalf) sets their level/years for a skill. */
export async function setEngineerSkill(
  ctx: CallerContext,
  engineerId: string,
  input: SetEngineerSkillInput,
) {
  const isSelf = assertCanManageEngineerSkills(ctx, engineerId);
  if (!isSelf) await authorize(ctx.session, "talent.engineer.write");

  const [skill] = await getDb().select().from(skills).where(eq(skills.id, input.skillId)).limit(1);
  if (!skill) throw new NotFoundError("Skill not found.");

  const [mapping] = await getDb()
    .insert(engineerSkills)
    .values({ engineerId, skillId: input.skillId, level: input.level, years: input.years })
    .onConflictDoUpdate({
      target: [engineerSkills.engineerId, engineerSkills.skillId],
      set: { level: input.level, years: input.years },
    })
    .returning();

  return mapping;
}

export async function removeEngineerSkill(ctx: CallerContext, engineerId: string, skillId: string) {
  const isSelf = assertCanManageEngineerSkills(ctx, engineerId);
  if (!isSelf) await authorize(ctx.session, "talent.engineer.write");

  await getDb()
    .delete(engineerSkills)
    .where(and(eq(engineerSkills.engineerId, engineerId), eq(engineerSkills.skillId, skillId)));
}
