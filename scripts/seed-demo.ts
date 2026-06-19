import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  activityEvents,
  briefs,
  engineers,
  invoices,
  matches,
  organizations,
  placements,
  projects,
  timesheetEntries,
  users,
} from "../src/db/schema";
import { dashboardDemoData } from "../src/data/dashboard-mock";
import { hashPassword } from "../src/lib/auth/password";

config({ path: ".env.local" });
config({ path: ".env" });

const rolePasswords = {
  admin: process.env.ADMIN_SEED_PASSWORD ?? "dennis-andishi@123",
  client: process.env.CLIENT_SEED_PASSWORD ?? "client-andishi@123",
  developer: process.env.DEVELOPER_SEED_PASSWORD ?? "developer-andishi@123",
} as const;

async function main() {
  const db = getDb();
  console.log("Seeding dashboard demo data");

  const userIdMap = new Map<string, string>();

  for (const demoUser of dashboardDemoData.users) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, demoUser.email))
      .limit(1);

    const id = existing?.id ?? demoUser.id;
    userIdMap.set(demoUser.id, id);

    const passwordHash = await hashPassword(rolePasswords[demoUser.role]);
    const values = {
      id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      status: demoUser.status,
      emailVerified: demoUser.emailVerified,
      organizationId: "organizationId" in demoUser ? demoUser.organizationId : null,
      engineerId: "engineerId" in demoUser ? demoUser.engineerId : null,
      passwordHash,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(users).set(values).where(eq(users.id, id));
    } else {
      await db.insert(users).values(values);
    }
  }

  for (const organization of dashboardDemoData.organizations) {
    await db
      .insert(organizations)
      .values(organization)
      .onConflictDoUpdate({
        target: organizations.id,
        set: organization,
      });
  }

  for (const engineer of dashboardDemoData.engineers) {
    const values = {
      ...engineer,
      userId: mapUserId(userIdMap, engineer.userId),
      availableFrom: engineer.availableFrom,
      skills: [...engineer.skills],
      workHistory: engineer.workHistory.map((item) => ({ ...item })),
      stats: engineer.stats.map((item) => ({ ...item })),
      updatedAt: new Date(),
    };

    await db
      .insert(engineers)
      .values(values)
      .onConflictDoUpdate({
        target: engineers.id,
        set: values,
      });
  }

  for (const brief of dashboardDemoData.briefs) {
    const values = {
      ...brief,
      submittedById: mapUserId(userIdMap, brief.submittedById),
      submittedAt: new Date(brief.submittedAt),
      stackTags: [...brief.stackTags],
      updatedAt: new Date(),
    };

    await db
      .insert(briefs)
      .values(values)
      .onConflictDoUpdate({
        target: briefs.id,
        set: values,
      });
  }

  for (const match of dashboardDemoData.matches) {
    const optional = match as typeof match & {
      clientNotes?: string;
      clientPreferredSlot1?: string;
      clientPreferredSlot2?: string;
    };
    const values = {
      ...match,
      proposedAt: new Date(match.proposedAt),
      introScheduledAt: null,
      introCompletedAt: null,
      acceptedAt: null,
      clientNotes: optional.clientNotes ?? null,
      clientPreferredSlot1: optional.clientPreferredSlot1 ?? null,
      clientPreferredSlot2: optional.clientPreferredSlot2 ?? null,
      updatedAt: new Date(),
    };

    await db
      .insert(matches)
      .values(values)
      .onConflictDoUpdate({
        target: matches.id,
        set: values,
      });
  }

  for (const placement of dashboardDemoData.placements) {
    const values = { ...placement, updatedAt: new Date() };

    await db
      .insert(placements)
      .values(values)
      .onConflictDoUpdate({
        target: placements.id,
        set: values,
      });
  }

  for (const project of dashboardDemoData.projects) {
    const values = {
      ...project,
      engineerIds: [...project.engineerIds],
      stackTags: [...project.stackTags],
      milestones: project.milestones.map((milestone) => ({ ...milestone })),
      updatedAt: new Date(),
    };

    await db
      .insert(projects)
      .values(values)
      .onConflictDoUpdate({
        target: projects.id,
        set: values,
      });
  }

  for (const invoice of dashboardDemoData.invoices) {
    const values = {
      ...invoice,
      issuedAt: invoice.issuedAt ? new Date(invoice.issuedAt) : null,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
      pdfUrl: null,
      updatedAt: new Date(),
    };

    await db
      .insert(invoices)
      .values(values)
      .onConflictDoUpdate({
        target: invoices.id,
        set: values,
      });
  }

  for (const timesheet of dashboardDemoData.timesheets) {
    const values = {
      ...timesheet,
      submittedAt: new Date(`${timesheet.date}T18:00:00.000Z`),
      approvedAt: null,
      updatedAt: new Date(),
    };

    await db
      .insert(timesheetEntries)
      .values(values)
      .onConflictDoUpdate({
        target: timesheetEntries.id,
        set: values,
      });
  }

  for (const event of dashboardDemoData.activity) {
    const values = {
      ...event,
      actorId: event.actorId ? mapUserId(userIdMap, event.actorId) : null,
      createdAt: new Date(event.createdAt),
      metadata: {},
      visibleTo: [...event.visibleTo],
    };

    await db
      .insert(activityEvents)
      .values(values)
      .onConflictDoUpdate({
        target: activityEvents.id,
        set: values,
      });
  }

  console.log("Demo users:");
  console.log(`- admin: dennis@andishi.dev / ${rolePasswords.admin}`);
  console.log(`- client: client@andishi.dev / ${rolePasswords.client}`);
  console.log(`- developer: developer@andishi.dev / ${rolePasswords.developer}`);
  console.log("Dashboard demo data seeded.");
}

function mapUserId(userIdMap: Map<string, string>, id: string) {
  return userIdMap.get(id) ?? id;
}

main().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
