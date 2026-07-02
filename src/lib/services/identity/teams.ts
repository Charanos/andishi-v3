import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { teamMembers, teams, userRoles } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  addTeamMemberSchema,
  createTeamSchema,
  updateTeamSchema,
} from "@/lib/validation/identity";

type CreateTeamInput = z.infer<typeof createTeamSchema>;
type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listTeams(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view teams.");
  await authorize(ctx.session, "identity.team.read");

  return getDb().select().from(teams).orderBy(teams.name);
}

export async function getTeam(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can view teams.");
  await authorize(ctx.session, "identity.team.read");

  const [team] = await getDb().select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) throw new NotFoundError("Team not found.");

  const members = await getDb().select().from(teamMembers).where(eq(teamMembers.teamId, id));

  return { ...team, members };
}

export async function createTeam(ctx: CallerContext, input: CreateTeamInput) {
  assertStaff(ctx, "Only Andishi staff can create teams.");
  await authorize(ctx.session, "identity.team.write");

  return getDb().transaction(async (tx) => {
    const [team] = await tx.insert(teams).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.team.write",
        resourceType: "team",
        resourceId: team.id,
        after: team,
        requestId: ctx.requestId,
      },
      tx,
    );

    return team;
  });
}

export async function updateTeam(ctx: CallerContext, id: string, input: UpdateTeamInput) {
  assertStaff(ctx, "Only Andishi staff can edit teams.");
  await authorize(ctx.session, "identity.team.write");

  const [existing] = await getDb().select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Team not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx.update(teams).set(input).where(eq(teams.id, id)).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.team.write",
        resourceType: "team",
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

export async function deleteTeam(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete teams.");
  await authorize(ctx.session, "identity.team.write");

  const [existing] = await getDb().select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Team not found.");

  const [stillScoped] = await getDb()
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(eq(userRoles.scopeTeamId, id))
    .limit(1);
  if (stillScoped) {
    throw new ConflictError(
      "This team still has team-scoped role assignments - revoke them first.",
    );
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(teamMembers).where(eq(teamMembers.teamId, id));
    await tx.delete(teams).where(eq(teams.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.team.write",
        resourceType: "team",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}

export async function addTeamMember(ctx: CallerContext, teamId: string, input: AddTeamMemberInput) {
  assertStaff(ctx, "Only Andishi staff can manage team membership.");
  await authorize(ctx.session, "identity.team.write");

  const [team] = await getDb().select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!team) throw new NotFoundError("Team not found.");

  const [existing] = await getDb()
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, input.userId)))
    .limit(1);
  if (existing) throw new ConflictError("This user is already a member of this team.");

  const [member] = await getDb()
    .insert(teamMembers)
    .values({ teamId, userId: input.userId, title: input.title })
    .returning();

  return member;
}

export async function removeTeamMember(ctx: CallerContext, teamId: string, userId: string) {
  assertStaff(ctx, "Only Andishi staff can manage team membership.");
  await authorize(ctx.session, "identity.team.write");

  await getDb()
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
}
