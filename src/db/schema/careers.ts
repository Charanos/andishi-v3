import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { organizations } from "@/db/schema/organizations";
import { users } from "@/db/schema/users";

// ADR-0006 (Careers / Talent Supply). One unified pipeline across all
// three supply channels - freelance project work, internal recruitment,
// and third-party outsourcing - discriminated by `kind`, not three
// separate table sets. See ADR-0006 for why.

export const jobKindEnum = pgEnum("job_kind", ["freelance", "internal", "outsourced"]);
export const jobStatusEnum = pgEnum("job_status", ["draft", "open", "closed"]);
export const applicationStageEnum = pgEnum("application_stage", [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
]);

export interface ApplicationLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

// ── Job openings ────────────────────────────────────────────────────

export const jobOpenings = pgTable(
  "job_openings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    kind: jobKindEnum("kind").notNull(),
    department: text("department").notNull(),
    location: text("location").notNull(),
    remote: boolean("remote").notNull().default(false),
    seniority: text("seniority").notNull(),
    descriptionMd: text("description_md").notNull(),
    skills: jsonb("skills").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    compensationNote: text("compensation_note"),
    status: jobStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // Set for outsourced/client-facing roles - which client this placement is for.
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("job_openings_status_idx").on(table.status),
    kindIdx: index("job_openings_kind_idx").on(table.kind),
  }),
);

// ── Applications ──────────────────────────────────────────────────────

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobOpeningId: uuid("job_opening_id")
      .notNull()
      .references(() => jobOpenings.id, { onDelete: "cascade" }),
    applicantName: text("applicant_name").notNull(),
    applicantEmail: text("applicant_email").notNull(),
    resumeUrl: text("resume_url"),
    links: jsonb("links").$type<ApplicationLinks>().notNull().default(sql`'{}'::jsonb`),
    coverNote: text("cover_note"),
    // Set if the applicant already exists in the engineer network (e.g.
    // applying for an internal/outsourced role while already vetted).
    engineerId: uuid("engineer_id").references(() => engineers.id, { onDelete: "set null" }),
    stage: applicationStageEnum("stage").notNull().default("applied"),
    source: text("source").notNull().default("careers_portal"),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    rating: integer("rating"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    jobOpeningIdx: index("applications_job_opening_id_idx").on(table.jobOpeningId),
    stageIdx: index("applications_stage_idx").on(table.stage),
  }),
);

// ── Application events (audit/notes trail per application) ──────────

export const applicationEvents = pgTable(
  "application_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "status_change" | "rating_assigned" | "note" | ...
    note: text("note").notNull(),
    // Null means a system-generated event (e.g. "Application submitted").
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationIdx: index("application_events_application_id_idx").on(table.applicationId),
  }),
);

export type JobOpening = typeof jobOpenings.$inferSelect;
export type NewJobOpening = typeof jobOpenings.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationEvent = typeof applicationEvents.$inferSelect;
export type NewApplicationEvent = typeof applicationEvents.$inferInsert;
