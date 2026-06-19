import { arrayContains, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
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
} from "@/db/schema";
import type { AuthUser } from "@/types/auth";

export async function getAdminOverviewData() {
  const db = getDb();
  const [
    briefCount,
    matchingBriefCount,
    engineerCount,
    verifiedEngineerCount,
    clientCount,
    activePlacementCount,
    allInvoices,
    recentBriefs,
    recentActivity,
  ] = await Promise.all([
    getCount(briefs),
    getCount(briefs, eq(briefs.status, "matching")),
    getCount(engineers),
    getCount(engineers, eq(engineers.verified, true)),
    getCount(users, eq(users.role, "client")),
    getCount(placements, eq(placements.status, "active")),
    db.select().from(invoices),
    db.select().from(briefs).orderBy(desc(briefs.createdAt)).limit(5),
    db.select().from(activityEvents).orderBy(desc(activityEvents.createdAt)).limit(6),
  ]);

  const revenueCents = allInvoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return {
    counts: {
      activePlacements: activePlacementCount,
      briefs: briefCount,
      clients: clientCount,
      engineers: engineerCount,
      matchingBriefs: matchingBriefCount,
      paidRevenueCents: revenueCents,
      verifiedEngineers: verifiedEngineerCount,
    },
    recentActivity,
    recentBriefs,
  };
}

export async function getClientOverviewData(user: AuthUser) {
  const db = getDb();

  if (!user.organizationId) {
    return {
      activity: [],
      briefs: [],
      matches: [],
      organization: null,
      placements: [],
      projects: [],
      invoices: [],
    };
  }

  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  const [clientBriefs, clientPlacements, clientProjects, clientInvoices, clientActivity] =
    await Promise.all([
      db
        .select()
        .from(briefs)
        .where(eq(briefs.organizationId, user.organizationId))
        .orderBy(desc(briefs.createdAt)),
      db.select().from(placements).where(eq(placements.organizationId, user.organizationId)),
      db.select().from(projects).where(eq(projects.organizationId, user.organizationId)),
      db.select().from(invoices).where(eq(invoices.organizationId, user.organizationId)),
      db
        .select()
        .from(activityEvents)
        .where(eq(activityEvents.organizationId, user.organizationId))
        .orderBy(desc(activityEvents.createdAt))
        .limit(6),
    ]);

  const clientMatches = clientBriefs.length
    ? await db
        .select({ match: matches, engineer: engineers })
        .from(matches)
        .innerJoin(engineers, eq(matches.engineerId, engineers.id))
        .where(inArray(matches.briefId, clientBriefs.map((brief) => brief.id)))
        .orderBy(desc(matches.createdAt))
        .limit(6)
    : [];

  return {
    activity: clientActivity,
    briefs: clientBriefs,
    invoices: clientInvoices,
    matches: clientMatches,
    organization: organization ?? null,
    placements: clientPlacements,
    projects: clientProjects,
  };
}

export async function getDeveloperOverviewData(user: AuthUser) {
  const db = getDb();

  if (!user.engineerId) {
    return {
      activity: [],
      engineer: null,
      invoices: [],
      matches: [],
      placements: [],
      projects: [],
      timesheets: [],
    };
  }

  const [engineer] = await db
    .select()
    .from(engineers)
    .where(eq(engineers.id, user.engineerId))
    .limit(1);

  const [developerMatches, developerPlacements, developerProjects, timesheets, developerInvoices, activity] =
    await Promise.all([
      db.select().from(matches).where(eq(matches.engineerId, user.engineerId)),
      db.select().from(placements).where(eq(placements.engineerId, user.engineerId)),
      db.select().from(projects).where(arrayContains(projects.engineerIds, [user.engineerId])),
      db
        .select()
        .from(timesheetEntries)
        .where(eq(timesheetEntries.engineerId, user.engineerId))
        .orderBy(desc(timesheetEntries.createdAt)),
      db.select().from(invoices).where(eq(invoices.engineerId, user.engineerId)),
      db
        .select()
        .from(activityEvents)
        .where(eq(activityEvents.engineerId, user.engineerId))
        .orderBy(desc(activityEvents.createdAt))
        .limit(6),
    ]);

  return {
    activity,
    engineer: engineer ?? null,
    invoices: developerInvoices,
    matches: developerMatches,
    placements: developerPlacements,
    projects: developerProjects,
    timesheets,
  };
}

function getCount(
  table: PgTable,
  where?: SQL,
) {
  const query = getDb().select({ value: count() }).from(table);
  return where
    ? query
        .where(where)
        .then(([row]) => row?.value ?? 0)
    : query.then(([row]) => row?.value ?? 0);
}

export function compactDate(value: Date | string | null | undefined) {
  if (!value) return "-";

  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function daysSince(value: Date | string | null | undefined) {
  if (!value) return 0;

  const date = typeof value === "string" ? new Date(value) : value;
  const delta = Date.now() - date.getTime();
  return Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export function formatActivityTime(value: Date) {
  const now = Date.now();
  const delta = now - value.getTime();
  const minutes = Math.floor(delta / (1000 * 60));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return compactDate(value);
}
