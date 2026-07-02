import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { briefs } from "@/db/schema/briefs";
import { organizations } from "@/db/schema/organizations";
import { users } from "@/db/schema/users";

// ADR-0007's flow map: lead -> sales_manager qualifies -> brief -> project.
// This is the CRM module (master doc §6.3) that makes that first handoff a
// real, queryable record instead of a bare email or a brief created
// without an upstream funnel entry. Fixes a concrete gap found in the July
// 2 client-intake audit: /api/contact and /api/general-inquiry each had
// their own inconsistent, non-CRM way of remembering an inbound inquiry.

export const leadSourceEnum = pgEnum("lead_source", [
  "contact",
  "start_project",
  "hire",
  "referral",
  "campaign",
  "manual",
  "newsletter",
]);

export const leadTrackEnum = pgEnum("lead_track", ["build", "hire"]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "qualified",
  "nurturing",
  "won",
  "lost",
]);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: leadSourceEnum("source").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    phone: text("phone"),
    message: text("message"),
    intendedTrack: leadTrackEnum("intended_track").notNull(),
    // Plain text, validated by the shared serviceTypeEnum at the zod layer -
    // same convention as briefs.serviceType.
    serviceType: text("service_type"),
    briefType: text("brief_type"),
    utm: jsonb("utm").$type<Record<string, string>>(),
    status: leadStatusEnum("status").notNull().default("new"),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    // NEW, beyond the master doc's minimal column list: traceable link once
    // a lead is converted into a brief (manually via convertLeadToBrief, or
    // automatically for self-qualifying wizard submissions - see
    // src/lib/services/crm/leads.ts). Without this the lead->brief handoff
    // ADR-0007 describes would only be inferable by matching email/org,
    // which is exactly the kind of fuzzy correlation this table exists to
    // replace.
    convertedToBriefId: uuid("converted_to_brief_id").references(() => briefs.id, {
      onDelete: "set null",
    }),
    lostReason: text("lost_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("leads_status_idx").on(table.status),
    emailIdx: index("leads_email_idx").on(table.email),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export const dealStageEnum = pgEnum("deal_stage", [
  "qualification",
  "scoping",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
]);

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    valueCents: integer("value_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    stage: dealStageEnum("stage").notNull().default("qualification"),
    probability: integer("probability").notNull().default(50),
    expectedClose: text("expected_close"),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id),
    lostReason: text("lost_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    stageIdx: index("deals_stage_idx").on(table.stage),
  }),
);

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
]);

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    bodyMd: text("body_md").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    status: proposalStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dealIdx: index("proposals_deal_idx").on(table.dealId),
  }),
);

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;

export const dealActivityTypeEnum = pgEnum("deal_activity_type", [
  "call",
  "email",
  "meeting",
  "note",
  "stage_change",
]);

export const dealActivities = pgTable(
  "deal_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    type: dealActivityTypeEnum("type").notNull(),
    note: text("note").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dealIdx: index("deal_activities_deal_idx").on(table.dealId),
  }),
);

export type DealActivity = typeof dealActivities.$inferSelect;
export type NewDealActivity = typeof dealActivities.$inferInsert;
