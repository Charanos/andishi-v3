import { asc, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { type Project, engineers, projectMessages, users } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { createNotification } from "@/lib/services/support/notifications";
import { resolveProjectAccess } from "@/lib/services/delivery/access";
import type { CallerContext } from "@/lib/services/types";
import type { createProjectMessageSchema } from "@/lib/validation/messaging";

type CreateProjectMessageInput = z.infer<typeof createProjectMessageSchema>;

/** Every user who should see/be notified about this project's thread: the lead PM, the client org, and the assigned engineer(s). */
async function getProjectParticipantUserIds(project: Project): Promise<string[]> {
  const db = getDb();
  const ids = new Set<string>();

  if (project.leadPmUserId) ids.add(project.leadPmUserId);

  const clientUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.organizationId, project.organizationId));
  for (const u of clientUsers) ids.add(u.id);

  if (project.engineerIds.length > 0) {
    const engineerUsers = await db
      .select({ userId: engineers.userId })
      .from(engineers)
      .where(inArray(engineers.id, project.engineerIds));
    for (const e of engineerUsers) ids.add(e.userId);
  }

  return Array.from(ids);
}

export async function listProjectMessages(ctx: CallerContext, projectId: string) {
  const { session } = ctx;
  const { scope } = await resolveProjectAccess(ctx, projectId);
  if (scope === "staff") await authorize(session, "delivery.message.read");

  return getDb()
    .select()
    .from(projectMessages)
    .where(eq(projectMessages.projectId, projectId))
    .orderBy(asc(projectMessages.createdAt));
}

export async function createProjectMessage(
  ctx: CallerContext,
  projectId: string,
  input: CreateProjectMessageInput,
) {
  const { session } = ctx;
  const { project, scope } = await resolveProjectAccess(ctx, projectId);
  if (scope === "staff") await authorize(session, "delivery.message.write");

  return getDb().transaction(async (tx) => {
    const [message] = await tx
      .insert(projectMessages)
      .values({
        projectId,
        senderUserId: session.user.id,
        body: input.body,
        attachments: input.attachments,
      })
      .returning();

    const participantIds = await getProjectParticipantUserIds(project);
    const recipients = participantIds.filter((id) => id !== session.user.id);

    for (const userId of recipients) {
      await createNotification(tx, {
        userId,
        type: "project_message",
        title: `New message on "${project.title}"`,
        entityType: "project",
        entityId: project.id,
      });
    }

    return message;
  });
}
