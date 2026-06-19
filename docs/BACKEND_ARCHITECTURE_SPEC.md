# Andishi v3 - Backend Architecture Specification

**Version**: 2.0
**Date**: June 2026
**Repo**: `https://github.com/Charanos/andishi-v3.git`
**Verification gate**: `npx tsc --noEmit` - never run builds unless explicitly asked
**Supersedes**: `BACKEND_ARCHITECTURE_SPEC.md` v1.0 (May 2026)
**Feeds into**: `DASHBOARD_MASTER_IMPLEMENTATION.md` (dashboard phase)

---

## AGENT INSTRUCTIONS

Read every section before creating a single file. This document governs the complete backend architecture for Andishi v3 and reflects the June 2026 repositioning: Andishi is a software development studio. The primary intake path is a project build inquiry; engineering talent placement is a secondary track. Both tracks share the same auth, session, and entity infrastructure.

**Key changes from v1.0:**
- `briefs` schema gains a `briefType` discriminator (`"build"` | `"hire"`) and build-specific fields.
- `projects` schema gains public case study fields: `serviceType`, `vertical`, `isPublic`, `publicSlug`, `challenge`, `solution`, `outcome`.
- `organizations` schema gains a `region` field for global client tracking.
- New public API routes: `GET /api/work` and `POST /api/contact`.
- New email templates: `project-inquiry.ts` and `build-brief-confirmation.ts`.
- Execution order updated to include new routes and schema changes.

Do not install `next-auth`, `clerk`, `auth.js`, `passport`, or any third-party auth library. Auth is custom-built per Part 5. Execute in the order given in Part 15.

---

## PART 1: ARCHITECTURE OVERVIEW

### Approach

Andishi v3 is a Next.js 16 App Router monolith. The backend lives entirely inside Next.js:

- **Database**: Neon Postgres (serverless, HTTP driver for Vercel compatibility)
- **ORM**: Drizzle ORM - type-safe, SQL-first, native Neon serverless driver support
- **Auth**: Custom - bcrypt password hashing + signed JWT sessions in HTTP-only cookies. Google OAuth via raw OAuth2 PKCE flow. Zero third-party auth libraries.
- **API layer**: Next.js Route Handlers (`src/app/api/`) - no separate Express server
- **Validation**: Zod - input validation on every route before any DB operation
- **Email**: Resend - transactional email (verification, invite, project inquiry confirmation, match notification)
- **File storage**: Vercel Blob - avatar uploads, invoice PDFs, case study cover images
- **Background jobs**: Vercel Cron - scheduled digest emails, invoice generation

### Out of scope

- Prisma (Drizzle is used instead - better DX with Neon serverless)
- Any third-party auth library (next-auth, clerk, passport)
- Separate Express/Fastify server
- Redis (Neon Postgres handles session lookups at this scale)
- GraphQL (REST route handlers are sufficient)
- Stripe (placeholder only - separate sprint)
- Custom WebSocket chat (Crisp handles messaging)

### Public vs authenticated route split

| Route | Auth required | Who can call |
|---|---|---|
| `GET /api/work` | No | Anyone - public case studies |
| `POST /api/contact` | No | Anyone - build or hire inquiry |
| `GET /api/engineers` | No (filtered) | Public gets verified+public only; admin gets all |
| `GET /api/engineers/[id]` | No (filtered) | Same as above |
| All other `/api/*` routes | Yes | Role-scoped per route |

---

## PART 2: DIRECTORY STRUCTURE

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── google/route.ts
│   │   │   ├── google/callback/route.ts
│   │   │   ├── verify-email/route.ts
│   │   │   └── forgot-password/route.ts
│   │   ├── users/
│   │   │   ├── me/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── organizations/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── engineers/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── briefs/
│   │   │   ├── route.ts              ← dual-track: build + hire
│   │   │   └── [id]/route.ts
│   │   ├── matches/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── placements/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── work/
│   │   │   └── route.ts              ← NEW: public case studies
│   │   ├── contact/
│   │   │   └── route.ts              ← NEW: dual-track public intake
│   │   ├── timesheets/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── invoices/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── activity/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   └── (app)/
│       └── layout.tsx
│
├── db/
│   ├── index.ts
│   ├── schema/
│   │   ├── index.ts                  ← Re-exports all schemas
│   │   ├── users.ts
│   │   ├── sessions.ts
│   │   ├── organizations.ts          ← Updated: region field
│   │   ├── engineers.ts
│   │   ├── briefs.ts                 ← Updated: briefType + build fields
│   │   ├── matches.ts
│   │   ├── placements.ts
│   │   ├── projects.ts               ← Updated: public case study fields
│   │   ├── timesheets.ts
│   │   ├── invoices.ts
│   │   └── activity.ts
│   ├── migrations/
│   └── seed/
│       ├── index.ts
│       └── admin.ts
│
├── lib/
│   ├── auth/
│   │   ├── session.ts
│   │   ├── password.ts
│   │   ├── google.ts
│   │   └── guards.ts
│   ├── email/
│   │   ├── index.ts
│   │   └── templates/
│   │       ├── verify-email.ts
│   │       ├── invite-user.ts
│   │       ├── password-reset.ts
│   │       ├── match-proposed.ts
│   │       ├── project-inquiry.ts    ← NEW
│   │       └── build-brief-confirm.ts ← NEW
│   ├── storage/
│   │   └── index.ts
│   └── validation/
│       ├── auth.ts
│       ├── briefs.ts                 ← Updated: dual-track schemas
│       ├── contact.ts                ← NEW: public intake schema
│       ├── engineers.ts
│       ├── projects.ts               ← Updated: public fields
│       └── timesheets.ts
│
├── types/
│   ├── auth.ts
│   └── entities.ts                   ← Updated: new entity types
│
└── scripts/
    └── seed-admin.ts
```

---

## PART 3: DATABASE - NEON POSTGRES + DRIZZLE ORM

### Installation

```bash
npm install drizzle-orm @neondatabase/serverless bcryptjs jsonwebtoken zod resend
npm install -D drizzle-kit @types/bcryptjs @types/jsonwebtoken dotenv tsx
```

### Connection - src/db/index.ts

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === "development" });
export type DB = typeof db;
```

### drizzle.config.ts (root)

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### package.json scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit push",
    "db:studio":   "drizzle-kit studio",
    "seed:admin":  "tsx src/scripts/seed-admin.ts"
  }
}
```

---

## PART 4: COMPLETE SCHEMA

### src/db/schema/users.ts

```ts
import {
  pgTable, pgEnum, uuid, text, timestamp, boolean
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin", "client", "developer"
]);

export const userStatusEnum = pgEnum("user_status", [
  "active", "invited", "disabled"
]);

export const users = pgTable("users", {
  id:             uuid("id").primaryKey().defaultRandom(),
  email:          text("email").notNull().unique(),
  name:           text("name").notNull(),
  avatarUrl:      text("avatar_url"),
  role:           userRoleEnum("role").notNull().default("client"),
  status:         userStatusEnum("status").notNull().default("invited"),
  passwordHash:   text("password_hash"),
  googleId:       text("google_id").unique(),
  emailVerified:  boolean("email_verified").notNull().default(false),
  organizationId: uuid("organization_id"),
  engineerId:     uuid("engineer_id"),
  lastLoginAt:    timestamp("last_login_at", { withTimezone: true }),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### src/db/schema/sessions.ts

```ts
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revoked:   boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
```

### src/db/schema/organizations.ts

```ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id:           uuid("id").primaryKey().defaultRandom(),
  name:         text("name").notNull(),
  website:      text("website"),
  industry:     text("industry"),
  stage:        text("stage"),      // "seed" | "series_a" | "series_b" | "enterprise" | "sme"
  logoUrl:      text("logo_url"),
  billingEmail: text("billing_email"),
  // NEW - June 2026: global client tracking
  region:       text("region"),     // "east_africa" | "north_america" | "europe" | "gcc" | "global"
  country:      text("country"),    // ISO 3166-1 alpha-2 e.g. "KE", "US", "GB"
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Organization    = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
```

### src/db/schema/engineers.ts

```ts
import {
  pgTable, pgEnum, uuid, text, integer, boolean,
  timestamp, jsonb
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const availabilityEnum = pgEnum("availability_status", [
  "available", "soon", "engaged"
]);

export const engineers = pgTable("engineers", {
  id:              uuid("id").primaryKey().defaultRandom(),
  userId:          uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug:            text("slug").notNull().unique(),
  name:            text("name").notNull(),
  role:            text("role").notNull(),
  domain:          text("domain").notNull(),
  domainLabel:     text("domain_label").notNull(),
  avatar:          text("avatar").notNull(),
  avatarColor:     text("avatar_color").notNull(),
  avatarUrl:       text("avatar_url"),
  yearsExp:        integer("years_exp").notNull().default(0),
  location:        text("location").notNull(),
  timezone:        text("timezone").notNull(),
  availability:    availabilityEnum("availability").notNull().default("available"),
  availableFrom:   text("available_from"),
  bio:             text("bio"),
  highlight:       text("highlight"),
  skills:          jsonb("skills").$type<string[]>().notNull().default([]),
  workHistory:     jsonb("work_history").$type<WorkHistoryItem[]>().notNull().default([]),
  stats:           jsonb("stats").$type<EngineerStat[]>().notNull().default([]),
  githubUrl:       text("github_url"),
  linkedinUrl:     text("linkedin_url"),
  portfolioUrl:    text("portfolio_url"),
  profileComplete: boolean("profile_complete").notNull().default(false),
  isPublic:        boolean("is_public").notNull().default(true),
  verified:        boolean("verified").notNull().default(false),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface WorkHistoryItem {
  company:     string;
  role:        string;
  period:      string;
  achievement: string;
}

export interface EngineerStat {
  label: string;
  value: string;
}

export type Engineer    = typeof engineers.$inferSelect;
export type NewEngineer = typeof engineers.$inferInsert;
```

### src/db/schema/briefs.ts

```ts
import {
  pgTable, pgEnum, uuid, text, boolean, timestamp, jsonb
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const briefStatusEnum = pgEnum("brief_status", [
  "draft", "submitted", "under_review", "matching",
  "shortlisted", "scoping", "closed"
]);

// NEW - June 2026: discriminates between a software build and a talent hire brief
export const briefTypeEnum = pgEnum("brief_type", [
  "build",   // client wants Andishi to design and deliver software
  "hire",    // client wants to extend their own team with a placed engineer
]);

export const briefs = pgTable("briefs", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  submittedById:  uuid("submitted_by_id").notNull().references(() => users.id),

  // ── Shared fields ──────────────────────────────────────────────
  title:       text("title").notNull(),
  status:      briefStatusEnum("status").notNull().default("submitted"),
  andishiNotes: text("andishi_notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  // NEW - June 2026: brief type discriminator
  briefType:   briefTypeEnum("brief_type").notNull().default("hire"),

  // ── Build brief fields (populated when briefType = "build") ────
  serviceType:       text("service_type"),
  // One of: "custom-software" | "saas-development" | "ai-systems" |
  //         "mobile-apps" | "enterprise-software" | "blockchain" |
  //         "apis-integrations" | "product-strategy"
  problemStatement:  text("problem_statement"),
  projectBudget:     text("project_budget"),    // free text: "$5k–$15k", "Open to discuss"
  projectTimeline:   text("project_timeline"),  // free text: "8 weeks", "ASAP"
  targetLaunchDate:  text("target_launch_date"),
  hasExistingProduct: boolean("has_existing_product").default(false),
  existingProductUrl: text("existing_product_url"),
  buildStackPreferences: jsonb("build_stack_preferences").$type<string[]>().default([]),

  // ── Hire brief fields (populated when briefType = "hire") ──────
  role:            text("role"),
  domain:          text("domain"),
  seniority:       text("seniority"),  // "mid" | "senior" | "lead" | "architect"
  stackTags:       jsonb("stack_tags").$type<string[]>().default([]),
  timeline:        text("timeline"),
  engagementModel: text("engagement_model"),  // "project" | "embedded" | "team_extension"
  description:     text("description"),
});

export type Brief    = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;
```

### src/db/schema/matches.ts

```ts
import { pgTable, pgEnum, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { briefs } from "./briefs";
import { engineers } from "./engineers";

export const matchStatusEnum = pgEnum("match_status", [
  "proposed",
  "client_reviewing",
  "intro_scheduled",
  "intro_completed",
  "accepted",
  "declined",
]);

export const matches = pgTable("matches", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  briefId:              uuid("brief_id").notNull().references(() => briefs.id),
  engineerId:           uuid("engineer_id").notNull().references(() => engineers.id),
  status:               matchStatusEnum("status").notNull().default("proposed"),
  proposedAt:           timestamp("proposed_at", { withTimezone: true }).notNull().defaultNow(),
  introScheduledAt:     timestamp("intro_scheduled_at", { withTimezone: true }),
  introCompletedAt:     timestamp("intro_completed_at", { withTimezone: true }),
  acceptedAt:           timestamp("accepted_at", { withTimezone: true }),
  adminNotes:           text("admin_notes"),
  clientNotes:          text("client_notes"),
  clientPreferredSlot1: text("client_preferred_slot_1"),
  clientPreferredSlot2: text("client_preferred_slot_2"),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Match    = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
```

### src/db/schema/placements.ts

```ts
import {
  pgTable, pgEnum, uuid, text, integer, timestamp
} from "drizzle-orm/pg-core";
import { matches } from "./matches";
import { engineers } from "./engineers";
import { organizations } from "./organizations";

export const placementStatusEnum = pgEnum("placement_status", [
  "active", "paused", "completed", "terminated"
]);

export const placements = pgTable("placements", {
  id:              uuid("id").primaryKey().defaultRandom(),
  matchId:         uuid("match_id").notNull().references(() => matches.id),
  engineerId:      uuid("engineer_id").notNull().references(() => engineers.id),
  organizationId:  uuid("organization_id").notNull().references(() => organizations.id),
  startDate:       text("start_date").notNull(),
  endDate:         text("end_date"),
  engagementModel: text("engagement_model").notNull(),
  status:          placementStatusEnum("status").notNull().default("active"),
  weeklyHours:     integer("weekly_hours").notNull().default(40),
  currency:        text("currency").notNull().default("USD"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Placement    = typeof placements.$inferSelect;
export type NewPlacement = typeof placements.$inferInsert;
```

### src/db/schema/projects.ts

```ts
import {
  pgTable, pgEnum, uuid, text, boolean, integer,
  timestamp, jsonb
} from "drizzle-orm/pg-core";
import { briefs } from "./briefs";
import { organizations } from "./organizations";
import { placements } from "./placements";

export const projectStatusEnum = pgEnum("project_status", [
  "scoping", "active", "review", "completed", "on_hold"
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending", "in_progress", "submitted", "approved", "revision"
]);

export const projects = pgTable("projects", {
  id:             uuid("id").primaryKey().defaultRandom(),
  briefId:        uuid("brief_id").references(() => briefs.id),
  placementId:    uuid("placement_id").references(() => placements.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  engineerIds:    jsonb("engineer_ids").$type<string[]>().notNull().default([]),
  title:          text("title").notNull(),
  description:    text("description").notNull(),
  status:         projectStatusEnum("status").notNull().default("active"),
  startDate:      text("start_date").notNull(),
  targetDate:     text("target_date").notNull(),
  stackTags:      jsonb("stack_tags").$type<string[]>().notNull().default([]),
  milestones:     jsonb("milestones").$type<Milestone[]>().notNull().default([]),

  // NEW - June 2026: public case study fields
  serviceType:             text("service_type"),
  // "custom-software" | "saas-development" | "ai-systems" | "mobile-apps"
  // "enterprise-software" | "blockchain" | "apis-integrations" | "product-strategy"
  vertical:                text("vertical"),
  // "fintech" | "healthtech" | "logistics" | "saas" | "ecommerce" |
  // "edtech" | "proptech" | "web3" | "enterprise" | "consumer"
  isPublic:                boolean("is_public").notNull().default(false),
  publicSlug:              text("public_slug").unique(),
  coverImageUrl:           text("cover_image_url"),
  challenge:               text("challenge"),
  solution:                text("solution"),
  outcome:                 text("outcome"),          // key result metric e.g. "6hrs"
  outcomeLabel:            text("outcome_label"),    // e.g. "saved per staff member weekly"
  clientQuote:             text("client_quote"),
  clientQuoteAttribution:  text("client_quote_attribution"),
  clientName:              text("client_name"),       // display name for the case study
  featuredOrder:           integer("featured_order"), // lower = appears earlier on /work

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface Milestone {
  id:          string;
  title:       string;
  status:      "pending" | "in_progress" | "submitted" | "approved" | "revision";
  dueDate:     string;
  description?: string;
}

export type Project    = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

### src/db/schema/timesheets.ts

```ts
import {
  pgTable, pgEnum, uuid, text, integer, timestamp
} from "drizzle-orm/pg-core";
import { placements } from "./placements";
import { engineers } from "./engineers";
import { users } from "./users";

export const timesheetStatusEnum = pgEnum("timesheet_status", [
  "draft", "submitted", "approved", "rejected"
]);

export const timesheets = pgTable("timesheets", {
  id:            uuid("id").primaryKey().defaultRandom(),
  placementId:   uuid("placement_id").notNull().references(() => placements.id),
  engineerId:    uuid("engineer_id").notNull().references(() => engineers.id),
  weekStartDate: text("week_start_date").notNull(),   // ISO date string "2026-06-09"
  weekEndDate:   text("week_end_date").notNull(),
  hoursLogged:   integer("hours_logged").notNull().default(0),
  status:        timesheetStatusEnum("status").notNull().default("draft"),
  notes:         text("notes"),
  approvedById:  uuid("approved_by_id").references(() => users.id),
  approvedAt:    timestamp("approved_at", { withTimezone: true }),
  submittedAt:   timestamp("submitted_at", { withTimezone: true }),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Timesheet    = typeof timesheets.$inferSelect;
export type NewTimesheet = typeof timesheets.$inferInsert;
```

### src/db/schema/invoices.ts

```ts
import {
  pgTable, pgEnum, uuid, text, integer, timestamp, jsonb
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { placements } from "./placements";
import { projects } from "./projects";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "issued", "paid", "overdue", "voided"
]);

export const invoices = pgTable("invoices", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  placementId:    uuid("placement_id").references(() => placements.id),
  projectId:      uuid("project_id").references(() => projects.id),
  amount:         integer("amount").notNull(),    // in cents
  currency:       text("currency").notNull().default("USD"),
  status:         invoiceStatusEnum("status").notNull().default("draft"),
  invoiceNumber:  text("invoice_number").notNull().unique(),
  issuedAt:       timestamp("issued_at", { withTimezone: true }),
  dueAt:          timestamp("due_at", { withTimezone: true }),
  paidAt:         timestamp("paid_at", { withTimezone: true }),
  pdfUrl:         text("pdf_url"),
  lineItems:      jsonb("line_items").$type<InvoiceLineItem[]>().notNull().default([]),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface InvoiceLineItem {
  description: string;
  quantity:    number;
  unitAmount:  number;   // in cents
  total:       number;   // in cents
}

export type Invoice    = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
```

### src/db/schema/activity.ts

```ts
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const activityEvents = pgTable("activity_events", {
  id:          uuid("id").primaryKey().defaultRandom(),
  type:        text("type").notNull(),
  // "engineer_added" | "brief_submitted" | "brief_build_submitted" |
  // "match_proposed" | "match_accepted" | "placement_started" |
  // "project_completed" | "project_published" | "invoice_issued" |
  // "contact_inquiry"
  actorId:     uuid("actor_id").references(() => users.id),
  actorRole:   text("actor_role"),
  entityType:  text("entity_type"),
  entityId:    uuid("entity_id"),
  description: text("description").notNull(),
  visibleTo:   jsonb("visible_to").$type<string[]>().notNull().default(["admin"]),
  metadata:    jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityEvent = typeof activityEvents.$inferSelect;
```

### src/db/schema/index.ts

```ts
export * from "./users";
export * from "./sessions";
export * from "./organizations";
export * from "./engineers";
export * from "./briefs";
export * from "./matches";
export * from "./placements";
export * from "./projects";
export * from "./timesheets";
export * from "./invoices";
export * from "./activity";
```

---

## PART 5: AUTH LIBRARY

### src/types/auth.ts

```ts
export type UserRole   = "admin" | "client" | "developer";
export type UserStatus = "active" | "invited" | "disabled";

export interface AuthUser {
  id:             string;
  email:          string;
  name:           string;
  avatarUrl?:     string;
  role:           UserRole;
  status:         UserStatus;
  organizationId?: string;
  engineerId?:    string;
  lastLoginAt?:   string;
  createdAt:      string;
}

export interface SessionPayload {
  sessionId: string;
  userId:    string;
  role:      UserRole;
  iat:       number;
  exp:       number;
}
```

### src/lib/auth/password.ts

```ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8)  return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}
```

### src/lib/auth/session.ts

```ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { AuthUser, SessionPayload } from "@/types/auth";

const JWT_SECRET           = process.env.JWT_SECRET!;
const SESSION_COOKIE       = "andishi_session";
const SESSION_DURATION_DAYS = 30;

export async function createSession(
  userId: string,
  metadata: { userAgent?: string; ipAddress?: string } = {}
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token:     "pending",
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      expiresAt,
    })
    .returning({ id: sessions.id });

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  const token = jwt.sign(
    { sessionId: session.id, userId, role: user.role },
    JWT_SECRET,
    { expiresIn: `${SESSION_DURATION_DAYS}d` }
  );

  await db
    .update(sessions)
    .set({ token })
    .where(eq(sessions.id, session.id));

  return token;
}

export function setSessionCookie(token: string): void {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_DURATION_DAYS * 24 * 60 * 60,
    path:     "/",
  });
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let payload: SessionPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, payload.sessionId),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, new Date())
      )
    );

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId));

  if (!user || user.status === "disabled") return null;

  db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id))
    .catch(() => {});

  return {
    id:             user.id,
    email:          user.email,
    name:           user.name,
    avatarUrl:      user.avatarUrl ?? undefined,
    role:           user.role,
    status:         user.status,
    organizationId: user.organizationId ?? undefined,
    engineerId:     user.engineerId ?? undefined,
    lastLoginAt:    user.lastLoginAt?.toISOString(),
    createdAt:      user.createdAt.toISOString(),
  };
}

export async function revokeSession(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
      await db
        .update(sessions)
        .set({ revoked: true })
        .where(eq(sessions.id, payload.sessionId));
    } catch {
      // Token already invalid - still clear cookie
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revoked: true })
    .where(eq(sessions.userId, userId));
}
```

### src/lib/auth/guards.ts

```ts
import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { AuthUser, UserRole } from "@/types/auth";

export const roleHome: Record<UserRole, string> = {
  admin:     "/admin",
  client:    "/dashboard",
  developer: "/dev",
};

export async function requireSession(redirectTo?: string): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/login${next}`);
  }
  if (user.status === "disabled") {
    redirect("/login?error=account_disabled");
  }
  return user;
}

export async function requireRole(
  requiredRole: UserRole,
  currentPath: string
): Promise<AuthUser> {
  const user = await requireSession(currentPath);
  if (user.role !== requiredRole) {
    redirect(roleHome[user.role]);
  }
  return user;
}
```

---

## PART 6: GOOGLE OAUTH2 - CUSTOM PKCE FLOW

### src/lib/auth/google.ts

```ts
import { randomBytes, createHash } from "crypto";

const GOOGLE_AUTH_URL     = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL    = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export interface GoogleUserInfo {
  sub:            string;
  email:          string;
  name:           string;
  picture:        string;
  email_verified: boolean;
}

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier  = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildAuthUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id:             process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:          process.env.GOOGLE_REDIRECT_URI!,
    response_type:         "code",
    scope:                 "openid email profile",
    code_challenge:        codeChallenge,
    code_challenge_method: "S256",
    state,
    access_type:           "offline",
    prompt:                "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  codeVerifier: string
): Promise<{ accessToken: string; idToken: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
      grant_type:    "authorization_code",
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const data = await res.json();
  return { accessToken: data.access_token, idToken: data.id_token };
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  return res.json();
}
```

---

## PART 7: AUTH API ROUTE HANDLERS

### src/app/api/auth/google/route.ts

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { buildAuthUrl, generatePKCE } from "@/lib/auth/google";

export async function GET() {
  const { verifier, challenge } = generatePKCE();
  const state = randomBytes(32).toString("base64url");

  const cookieStore = cookies();
  const opts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   600,
    path:     "/",
  };
  cookieStore.set("oauth_verifier", verifier, opts);
  cookieStore.set("oauth_state",    state,    opts);

  return NextResponse.redirect(buildAuthUrl(challenge, state));
}
```

### src/app/api/auth/google/callback/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { exchangeCode, getGoogleUser } from "@/lib/auth/google";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const verifier    = cookieStore.get("oauth_verifier")?.value;

  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_verifier");

  if (!code || !state || state !== storedState || !verifier) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  try {
    const { accessToken } = await exchangeCode(code, verifier);
    const googleUser = await getGoogleUser(accessToken);

    if (!googleUser.email_verified) {
      return NextResponse.redirect(new URL("/login?error=email_not_verified", req.url));
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.sub));

    if (!user) {
      const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email));

      if (existingByEmail) {
        [user] = await db
          .update(users)
          .set({
            googleId:      googleUser.sub,
            avatarUrl:     googleUser.picture,
            emailVerified: true,
          })
          .where(eq(users.id, existingByEmail.id))
          .returning();
      } else {
        [user] = await db
          .insert(users)
          .values({
            email:         googleUser.email,
            name:          googleUser.name,
            avatarUrl:     googleUser.picture,
            googleId:      googleUser.sub,
            emailVerified: true,
            role:          "client",
            status:        "active",
          })
          .returning();
      }
    }

    if (user.status === "disabled") {
      return NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
    }

    const token = await createSession(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    setSessionCookie(token);

    return NextResponse.redirect(
      new URL(roleHome[user.role as keyof typeof roleHome], req.url)
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
```

### src/app/api/auth/login/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/guards";
import { z } from "zod";

const LoginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  // Constant-time comparison to prevent email enumeration
  const passwordValid =
    user?.passwordHash
      ? await comparePassword(password, user.passwordHash)
      : await comparePassword(password, "$2a$12$invalidhashforconstanttime000000000000000");

  if (!user || !passwordValid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (user.status === "disabled") {
    return NextResponse.json(
      { error: "This account has been disabled. Contact support." },
      { status: 403 }
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before signing in." },
      { status: 403 }
    );
  }

  const token = await createSession(user.id, {
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim(),
  });
  setSessionCookie(token);

  return NextResponse.json({
    redirect: roleHome[user.role as keyof typeof roleHome],
  });
}
```

### src/app/api/auth/logout/route.ts

```ts
import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth/session";

export async function POST() {
  await revokeSession();
  return NextResponse.json({ redirect: "/login" });
}
```

### src/app/api/auth/register/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";
import { randomBytes } from "crypto";

const RegisterSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role:     z.enum(["client", "developer"]).default("client"),
});

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name, email, password, role } = parsed.data;

  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash        = await hashPassword(password);
  const verificationToken   = randomBytes(32).toString("hex");

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email:         email.toLowerCase(),
      passwordHash,
      role,
      status:        "active",
      emailVerified: false,
    })
    .returning();

  sendVerificationEmail(newUser.email, newUser.name, verificationToken).catch(
    (err) => console.error("Verification email failed:", err)
  );

  const token = await createSession(newUser.id, {
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  setSessionCookie(token);

  return NextResponse.json({
    redirect: role === "client" ? "/dashboard" : "/dev",
  });
}
```

---

## PART 8: STANDARD ROUTE HANDLER PATTERNS

Every authenticated route handler follows this structure.

### Standard GET (list with role-aware filtering)

```ts
// src/app/api/engineers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { engineers } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, ilike, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const { searchParams } = new URL(req.url);
  const domain       = searchParams.get("domain");
  const availability = searchParams.get("availability");
  const search       = searchParams.get("q");

  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(engineers.isPublic, true));
    conditions.push(eq(engineers.verified, true));
  }

  if (domain && domain !== "all") {
    conditions.push(eq(engineers.domain, domain));
  }

  if (availability) {
    conditions.push(eq(engineers.availability, availability as any));
  }

  if (search) {
    conditions.push(
      or(
        ilike(engineers.name,     `%${search}%`),
        ilike(engineers.role,     `%${search}%`),
        ilike(engineers.location, `%${search}%`)
      )!
    );
  }

  const result = await db
    .select()
    .from(engineers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(engineers.createdAt);

  const sanitized = isAdmin
    ? result
    : result.map(({ userId, ...rest }) => rest);

  return NextResponse.json({ engineers: sanitized });
}
```

### Standard POST (creates entity, admin-only)

```ts
export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Parse + validate
  const body   = await req.json().catch(() => null);
  const parsed = CreateEntitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // 3. Business logic
  const [entity] = await db.insert(table).values(parsed.data).returning();

  // 4. Activity log
  await db.insert(activityEvents).values({
    type:        "entity_created",
    actorId:     session.id,
    actorRole:   session.role,
    entityType:  "entity",
    entityId:    entity.id,
    description: `Entity created by ${session.name}`,
    visibleTo:   ["admin"],
  });

  return NextResponse.json({ entity }, { status: 201 });
}
```

### Standard error and success response shape

```ts
// All errors:
{ error: string }
{ error: string, field?: string }   // validation errors

// All successes:
{ [entityName]: data }              // single entity
{ [entityName]s: data[] }           // list
{ redirect: string }                // auth actions
{ success: true }                   // delete / side-effect
```

---

## PART 9: PUBLIC API ROUTES

These routes require no authentication. Both are rate-limited at the Vercel edge layer.

### GET /api/work - Public Case Studies

Returns all projects where `isPublic = true`, ordered by `featuredOrder`. Supports optional filtering by `service` and `vertical`. Powers the `/work` page.

```ts
// src/app/api/work/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, asc, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service  = searchParams.get("service");
  const vertical = searchParams.get("vertical");

  const conditions = [eq(projects.isPublic, true)];

  if (service && service !== "all") {
    conditions.push(eq(projects.serviceType, service));
  }

  if (vertical && vertical !== "all") {
    conditions.push(eq(projects.vertical, vertical));
  }

  const result = await db
    .select({
      id:                     projects.id,
      title:                  projects.title,
      publicSlug:             projects.publicSlug,
      serviceType:            projects.serviceType,
      vertical:               projects.vertical,
      coverImageUrl:          projects.coverImageUrl,
      challenge:              projects.challenge,
      solution:               projects.solution,
      outcome:                projects.outcome,
      outcomeLabel:           projects.outcomeLabel,
      clientQuote:            projects.clientQuote,
      clientQuoteAttribution: projects.clientQuoteAttribution,
      clientName:             projects.clientName,
      stackTags:              projects.stackTags,
      featuredOrder:          projects.featuredOrder,
      status:                 projects.status,
      startDate:              projects.startDate,
      targetDate:             projects.targetDate,
    })
    .from(projects)
    .where(and(...conditions))
    .orderBy(asc(projects.featuredOrder));

  return NextResponse.json({ work: result });
}
```

### POST /api/contact - Dual-Track Public Intake

Accepts both build inquiries and hire inquiries from unauthenticated visitors. Creates a brief record in the database, fires a confirmation email to the submitter, and notifies the admin.

```ts
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  briefs, organizations, users, activityEvents
} from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  sendProjectInquiryNotification,
  sendBuildBriefConfirmation,
  sendHireBriefConfirmation,
} from "@/lib/email";
import { z } from "zod";

// ── Validation schemas ────────────────────────────────────────────

const BuildContactSchema = z.object({
  type:             z.literal("build"),
  name:             z.string().min(2, "Name must be at least 2 characters"),
  email:            z.string().email("Invalid email"),
  company:          z.string().optional(),
  serviceType:      z.enum([
    "custom-software", "saas-development", "ai-systems",
    "mobile-apps", "enterprise-software", "blockchain",
    "apis-integrations", "product-strategy",
  ]),
  problemStatement: z.string().min(20, "Please describe your project in at least 20 characters"),
  projectBudget:    z.string().optional(),
  projectTimeline:  z.string().optional(),
});

const HireContactSchema = z.object({
  type:            z.literal("hire"),
  name:            z.string().min(2),
  email:           z.string().email("Invalid email"),
  company:         z.string().optional(),
  role:            z.string().min(2, "Role is required"),
  domain:          z.string().min(1, "Domain is required"),
  seniority:       z.enum(["mid", "senior", "lead", "architect"]),
  stackTags:       z.array(z.string()).default([]),
  timeline:        z.string().min(1, "Timeline is required"),
  engagementModel: z.enum(["project", "embedded", "team_extension"]),
  description:     z.string().min(20, "Please provide at least 20 characters of detail"),
});

const ContactSchema = z.discriminatedUnion("type", [
  BuildContactSchema,
  HireContactSchema,
]);

// ── Route handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // 1. Find or create a guest organization for the submitter
  //    (unauthenticated users don't have an org yet - use email as key)
  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.billingEmail, data.email.toLowerCase()));

  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({
        name:         data.company ?? data.name,
        billingEmail: data.email.toLowerCase(),
      })
      .returning();
  }

  // 2. Find or create a guest user record
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()));

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email:          data.email.toLowerCase(),
        name:           data.name,
        role:           "client",
        status:         "invited",   // not yet a registered user
        emailVerified:  false,
        organizationId: org.id,
      })
      .returning();
  }

  // 3. Create the brief
  const briefValues =
    data.type === "build"
      ? {
          organizationId:   org.id,
          submittedById:    user.id,
          title:            `Build: ${data.serviceType} - ${data.company ?? data.name}`,
          briefType:        "build" as const,
          serviceType:      data.serviceType,
          problemStatement: data.problemStatement,
          projectBudget:    data.projectBudget,
          projectTimeline:  data.projectTimeline,
          status:           "submitted" as const,
        }
      : {
          organizationId:  org.id,
          submittedById:   user.id,
          title:           `Hire: ${data.seniority} ${data.role} - ${data.company ?? data.name}`,
          briefType:       "hire" as const,
          role:            data.role,
          domain:          data.domain,
          seniority:       data.seniority,
          stackTags:       data.stackTags,
          timeline:        data.timeline,
          engagementModel: data.engagementModel,
          description:     data.description,
          status:          "submitted" as const,
        };

  const [brief] = await db.insert(briefs).values(briefValues).returning();

  // 4. Activity log
  await db.insert(activityEvents).values({
    type:        data.type === "build" ? "brief_build_submitted" : "brief_hire_submitted",
    actorId:     user.id,
    actorRole:   "client",
    entityType:  "brief",
    entityId:    brief.id,
    description: `${data.type === "build" ? "Build" : "Hire"} inquiry from ${data.name} (${data.email})`,
    visibleTo:   ["admin"],
    metadata:    { company: data.company, serviceType: data.type === "build" ? data.serviceType : data.domain },
  });

  // 5. Send emails (non-blocking)
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "dennis@andishi.dev";

  if (data.type === "build") {
    sendBuildBriefConfirmation(data.email, data.name, data.serviceType).catch(
      (err) => console.error("Build confirmation email failed:", err)
    );
    sendProjectInquiryNotification(adminEmail, data).catch(
      (err) => console.error("Admin inquiry notification failed:", err)
    );
  } else {
    sendHireBriefConfirmation(data.email, data.name, data.role).catch(
      (err) => console.error("Hire confirmation email failed:", err)
    );
    sendProjectInquiryNotification(adminEmail, data).catch(
      (err) => console.error("Admin inquiry notification failed:", err)
    );
  }

  return NextResponse.json({ success: true, briefId: brief.id }, { status: 201 });
}
```

---

## PART 10: ENTITY API ROUTES

### Briefs - src/app/api/briefs/route.ts

The briefs route handles both `briefType: "build"` and `briefType: "hire"` records. Admin can see all; clients see only their own.

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { briefs, activityEvents } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const CreateBriefSchema = z.discriminatedUnion("briefType", [
  z.object({
    briefType:        z.literal("build"),
    organizationId:   z.string().uuid(),
    title:            z.string().min(3),
    serviceType:      z.string().min(1),
    problemStatement: z.string().min(20),
    projectBudget:    z.string().optional(),
    projectTimeline:  z.string().optional(),
    hasExistingProduct: z.boolean().default(false),
    existingProductUrl: z.string().url().optional(),
    buildStackPreferences: z.array(z.string()).default([]),
  }),
  z.object({
    briefType:       z.literal("hire"),
    organizationId:  z.string().uuid(),
    title:           z.string().min(3),
    role:            z.string().min(2),
    domain:          z.string().min(1),
    seniority:       z.enum(["mid", "senior", "lead", "architect"]),
    stackTags:       z.array(z.string()).default([]),
    timeline:        z.string().min(1),
    engagementModel: z.enum(["project", "embedded", "team_extension"]),
    description:     z.string().min(20),
  }),
]);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");  // "build" | "hire" | null (all)

  const conditions = [];

  // Clients see only their own org's briefs
  if (session.role === "client" && session.organizationId) {
    conditions.push(eq(briefs.organizationId, session.organizationId));
  }

  if (typeFilter && (typeFilter === "build" || typeFilter === "hire")) {
    conditions.push(eq(briefs.briefType, typeFilter));
  }

  const result = await db
    .select()
    .from(briefs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(briefs.createdAt));

  return NextResponse.json({ briefs: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["admin", "client"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json().catch(() => null);
  const parsed = CreateBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const [brief] = await db
    .insert(briefs)
    .values({ ...parsed.data, submittedById: session.id })
    .returning();

  await db.insert(activityEvents).values({
    type:        brief.briefType === "build" ? "brief_build_submitted" : "brief_hire_submitted",
    actorId:     session.id,
    actorRole:   session.role,
    entityType:  "brief",
    entityId:    brief.id,
    description: `${brief.briefType === "build" ? "Build" : "Hire"} brief "${brief.title}" submitted`,
    visibleTo:   ["admin", "client"],
  });

  return NextResponse.json({ brief }, { status: 201 });
}
```

### Projects - src/app/api/projects/route.ts

Admin and clients can manage projects. Includes support for publishing a project as a public case study.

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, activityEvents } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const CreateProjectSchema = z.object({
  organizationId: z.string().uuid(),
  title:          z.string().min(3),
  description:    z.string().min(10),
  startDate:      z.string(),
  targetDate:     z.string(),
  stackTags:      z.array(z.string()).default([]),
  engineerIds:    z.array(z.string()).default([]),
  briefId:        z.string().uuid().optional(),
  placementId:    z.string().uuid().optional(),
  // Public case study fields (optional at creation; published via PATCH later)
  serviceType:    z.string().optional(),
  vertical:       z.string().optional(),
});

const PublishCaseStudySchema = z.object({
  isPublic:                z.literal(true),
  publicSlug:              z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  coverImageUrl:           z.string().url().optional(),
  challenge:               z.string().min(20),
  solution:                z.string().min(20),
  outcome:                 z.string().min(1),
  outcomeLabel:            z.string().min(1),
  clientName:              z.string().min(1),
  clientQuote:             z.string().optional(),
  clientQuoteAttribution:  z.string().optional(),
  featuredOrder:           z.number().int().min(0).optional(),
  serviceType:             z.string(),
  vertical:                z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conditions = [];
  if (session.role === "client" && session.organizationId) {
    conditions.push(eq(projects.organizationId, session.organizationId));
  }

  const result = await db
    .select()
    .from(projects)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(projects.createdAt));

  return NextResponse.json({ projects: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json().catch(() => null);
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const [project] = await db.insert(projects).values(parsed.data).returning();

  await db.insert(activityEvents).values({
    type:        "project_created",
    actorId:     session.id,
    actorRole:   session.role,
    entityType:  "project",
    entityId:    project.id,
    description: `Project "${project.title}" created`,
    visibleTo:   ["admin"],
  });

  return NextResponse.json({ project }, { status: 201 });
}
```

### Projects [id] - Publish as Case Study

```ts
// src/app/api/projects/[id]/route.ts - PATCH handler (excerpt)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  // If publishing as case study, validate the full case study schema
  if (body?.isPublic === true) {
    const parsed = PublishCaseStudySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, params.id))
      .returning();

    await db.insert(activityEvents).values({
      type:        "project_published",
      actorId:     session.id,
      actorRole:   "admin",
      entityType:  "project",
      entityId:    updated.id,
      description: `Project "${updated.title}" published as public case study at /work/${updated.publicSlug}`,
      visibleTo:   ["admin"],
    });

    return NextResponse.json({ project: updated });
  }

  // Standard partial update
  const [updated] = await db
    .update(projects)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(projects.id, params.id))
    .returning();

  return NextResponse.json({ project: updated });
}
```

### Remaining Entity Routes

All remaining entity routes follow the standard pattern from Part 8. Implement in this order:

```
src/app/api/matches/route.ts          → GET (admin, client filtered)
src/app/api/matches/[id]/route.ts     → GET, PUT (status updates), DELETE (admin)
src/app/api/placements/route.ts       → GET, POST (admin)
src/app/api/placements/[id]/route.ts  → GET, PUT, DELETE (admin)
src/app/api/timesheets/route.ts       → GET, POST (developer, client filtered)
src/app/api/timesheets/[id]/route.ts  → GET, PUT (approve/reject by admin or client)
src/app/api/invoices/route.ts         → GET, POST (admin)
src/app/api/invoices/[id]/route.ts    → GET, PUT, DELETE (admin)
src/app/api/activity/route.ts         → GET (admin only, with pagination)
src/app/api/users/me/route.ts         → GET (authenticated user)
src/app/api/users/[id]/route.ts       → GET, PUT, DELETE (admin)
src/app/api/organizations/route.ts    → GET, POST (admin)
src/app/api/organizations/[id]/route.ts → GET, PUT, DELETE (admin)
src/app/api/upload/route.ts           → POST (authenticated, Vercel Blob)
```

---

## PART 11: SEED ADMIN

### src/scripts/seed-admin.ts

```ts
import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/auth/password";

async function seedAdmin() {
  const email    = process.env.ADMIN_SEED_EMAIL    ?? "dennis@andishi.dev";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "dennis-andishi@123";

  console.log(`Seeding admin: ${email}`);

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    await db
      .update(users)
      .set({ role: "admin", status: "active", passwordHash, emailVerified: true })
      .where(eq(users.id, existing.id));
    console.log("✓ Updated existing user → admin");
  } else {
    await db.insert(users).values({
      email,
      name:          "Dennis Munge",
      role:          "admin",
      status:        "active",
      emailVerified: true,
      passwordHash,
    });
    console.log("✓ Created admin user");
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

---

## PART 12: ENVIRONMENT VARIABLES

### .env.local (development)

```bash
# Neon Postgres - use the pooled connection string for the app
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# Auth - minimum 64 characters, generate with: openssl rand -hex 32
JWT_SECRET=<64-char-minimum-random-string>

# Google OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@andishi.dev

# Admin notifications
ADMIN_NOTIFICATION_EMAIL=dennis@andishi.dev

# Vercel Blob (file storage)
BLOB_READ_WRITE_TOKEN=

# Admin seed (override for different environments)
ADMIN_SEED_EMAIL=dennis@andishi.dev
ADMIN_SEED_PASSWORD=dennis-andishi@123

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### .env.production (Vercel environment variables panel)

```bash
DATABASE_URL=            # Neon production pooled connection string
JWT_SECRET=              # Different value from dev - generate fresh with openssl
GOOGLE_CLIENT_ID=        # Same Google app, production redirect URI added in console
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://andishi.dev/api/auth/google/callback
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@andishi.dev
ADMIN_NOTIFICATION_EMAIL=dennis@andishi.dev
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=https://andishi.dev
NODE_ENV=production
```

---

## PART 13: APP LAYOUT AUTH GUARD

### src/app/(app)/layout.tsx

```tsx
import { requireSession } from "@/lib/auth/guards";
import { AppShell } from "@/components/dashboard/shell/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  return <AppShell user={user}>{children}</AppShell>;
}
```

### src/app/(app)/admin/layout.tsx

```tsx
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin", "/admin");
  return <>{children}</>;
}
```

### src/app/(app)/dashboard/layout.tsx

```tsx
import { requireRole } from "@/lib/auth/guards";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("client", "/dashboard");
  return <>{children}</>;
}
```

### src/app/(app)/dev/layout.tsx

```tsx
import { requireRole } from "@/lib/auth/guards";

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("developer", "/dev");
  return <>{children}</>;
}
```

---

## PART 14: EMAIL - RESEND

### src/lib/email/index.ts

```ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// ── Verification ───────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "Verify your Andishi account",
    html: `
      <p>Hi ${name},</p>
      <p>Verify your email to activate your Andishi workspace:</p>
      <p><a href="${verifyUrl}">Verify email →</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

// ── Invite ─────────────────────────────────────────────────────────

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  role: string,
  inviteUrl: string
): Promise<void> {
  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `You've been invited to Andishi`,
    html: `
      <p>${inviterName} has invited you to join Andishi as a <strong>${role}</strong>.</p>
      <p><a href="${inviteUrl}">Accept invitation →</a></p>
      <p>This link expires in 48 hours.</p>
    `,
  });
}

// ── Match proposed (talent track) ──────────────────────────────────

export async function sendMatchProposedEmail(
  to: string,
  clientName: string,
  engineerName: string,
  dashboardUrl: string
): Promise<void> {
  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Your Andishi match is ready - ${engineerName}`,
    html: `
      <p>Hi ${clientName},</p>
      <p>We've matched a senior engineer to your brief: <strong>${engineerName}</strong>.</p>
      <p><a href="${dashboardUrl}">View profile and request an intro →</a></p>
    `,
  });
}

// ── Build brief confirmation (NEW - June 2026) ─────────────────────

export async function sendBuildBriefConfirmation(
  to: string,
  name: string,
  serviceType: string
): Promise<void> {
  const serviceLabel: Record<string, string> = {
    "custom-software":    "custom software development",
    "saas-development":   "SaaS product development",
    "ai-systems":         "AI and intelligent systems",
    "mobile-apps":        "mobile application development",
    "enterprise-software":"enterprise software",
    "blockchain":         "blockchain and Web3 development",
    "apis-integrations":  "API and systems integration",
    "product-strategy":   "product strategy and design",
  };

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "We received your project brief - Andishi",
    html: `
      <p>Hi ${name},</p>
      <p>We've received your build inquiry for <strong>${serviceLabel[serviceType] ?? serviceType}</strong>.</p>
      <p>Someone from the Andishi team will be in touch within one business day to schedule a scoping call.</p>
      <p>In the meantime, you can see examples of work we've shipped at <a href="${process.env.NEXT_PUBLIC_APP_URL}/work">andishi.dev/work</a>.</p>
      <p>- The Andishi Team</p>
    `,
  });
}

// ── Hire brief confirmation (NEW - June 2026) ──────────────────────

export async function sendHireBriefConfirmation(
  to: string,
  name: string,
  role: string
): Promise<void> {
  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "We received your hiring brief - Andishi",
    html: `
      <p>Hi ${name},</p>
      <p>We've received your request for a <strong>${role}</strong>.</p>
      <p>We typically propose a match within 8 business days. We'll contact you as soon as a profile is ready for your review.</p>
      <p>- The Andishi Team</p>
    `,
  });
}

// ── Admin inquiry notification (NEW - June 2026) ───────────────────

export async function sendProjectInquiryNotification(
  to: string,
  data: Record<string, unknown>
): Promise<void> {
  const type   = data.type === "build" ? "Build inquiry" : "Hire inquiry";
  const detail = data.type === "build"
    ? `Service: ${data.serviceType}<br>Budget: ${data.projectBudget ?? "Not specified"}<br>Timeline: ${data.projectTimeline ?? "Not specified"}`
    : `Role: ${data.role}<br>Domain: ${data.domain}<br>Seniority: ${data.seniority}`;

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `[Andishi] New ${type} from ${data.name}`,
    html: `
      <p><strong>${type}</strong></p>
      <p>Name: ${data.name}<br>Email: ${data.email}<br>Company: ${data.company ?? "Not provided"}</p>
      <p>${detail}</p>
      <p>
        ${data.type === "build"
          ? `<strong>Problem:</strong><br>${data.problemStatement}`
          : `<strong>Description:</strong><br>${data.description}`
        }
      </p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/briefs">View in Admin →</a></p>
    `,
  });
}

// ── Password reset ─────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "Reset your Andishi password",
    html: `
      <p>Hi ${name},</p>
      <p>Reset your password using the link below. It expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset password →</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
}
```

---

## PART 15: EXECUTION ORDER

Run in this exact sequence. Do not skip steps. Verify with `npx tsc --noEmit` after each phase.

### Phase 1 - Environment and database (45 min)

```bash
# Step 1: Install packages
npm install drizzle-orm @neondatabase/serverless bcryptjs jsonwebtoken zod resend
npm install -D drizzle-kit @types/bcryptjs @types/jsonwebtoken dotenv tsx
```

1. Create Neon project at neon.tech. Name it `andishi-v3`. Region: `eu-west-1`.
2. Enable connection pooling in Neon dashboard.
3. Copy the **pooled** connection string as `DATABASE_URL`.
4. Generate JWT secret: `openssl rand -hex 32` (must be 64+ chars).
5. Create Google OAuth2 app at console.cloud.google.com. Add both `localhost:3000/api/auth/google/callback` (dev) and `andishi.dev/api/auth/google/callback` (prod) as redirect URIs.
6. Create `.env.local` with all variables from Part 12.
7. Confirm `.env.local` is in `.gitignore`.

### Phase 2 - Schema (30 min)

1. Create `src/db/index.ts` (Part 3).
2. Create `drizzle.config.ts` at project root (Part 3).
3. Create all schema files in `src/db/schema/` (Part 4). Create in this order to avoid circular imports: `users.ts` → `sessions.ts` → `organizations.ts` → `engineers.ts` → `briefs.ts` → `matches.ts` → `placements.ts` → `projects.ts` → `timesheets.ts` → `invoices.ts` → `activity.ts`.
4. Create `src/db/schema/index.ts` re-export.
5. Add scripts to `package.json` (Part 3).
6. Run `npm run db:generate` - review generated SQL before applying.
7. Run `npm run db:migrate` - push schema to Neon.
8. Verify in Neon dashboard that all tables are created.

### Phase 3 - Auth library (45 min)

1. Create `src/types/auth.ts`.
2. Create `src/lib/auth/password.ts`.
3. Create `src/lib/auth/session.ts`.
4. Create `src/lib/auth/google.ts`.
5. Create `src/lib/auth/guards.ts`.
6. Run `npx tsc --noEmit` - zero errors before continuing.

### Phase 4 - Auth route handlers (30 min)

1. `src/app/api/auth/login/route.ts`
2. `src/app/api/auth/logout/route.ts`
3. `src/app/api/auth/register/route.ts`
4. `src/app/api/auth/google/route.ts`
5. `src/app/api/auth/google/callback/route.ts`
6. Run `npx tsc --noEmit`.

### Phase 5 - App layout guards (20 min)

1. Update `src/app/(app)/layout.tsx` with `requireSession`.
2. Add role layout guards: `admin/layout.tsx`, `dashboard/layout.tsx`, `dev/layout.tsx` (Part 13).
3. Update `AppShell` to accept `AuthUser` prop from the server layout.
4. Update `RoleSidebar` and `DashboardTopNav` to receive user context via props.

### Phase 6 - Login page (20 min)

1. Wire login form `onSubmit` to `POST /api/auth/login`.
2. On success, follow the `redirect` field in the response.
3. Add "Sign in with Google" button → `GET /api/auth/google`.
4. Handle `?error=` query params with inline error messages.

### Phase 7 - Seed and verify auth (15 min)

1. Create `src/scripts/seed-admin.ts` (Part 11).
2. Add `"seed:admin": "tsx src/scripts/seed-admin.ts"` to `package.json`.
3. Run `npm run seed:admin`.
4. Test: login as `dennis@andishi.dev` → lands on `/admin`.
5. Test: unauthenticated visit to `/admin` → redirected to `/login`.
6. Test: login as client → lands on `/dashboard`.
7. Run `npx tsc --noEmit` - zero errors.

### Phase 8 - Email library (30 min)

1. Create `src/lib/email/index.ts` with all templates from Part 14.
2. Wire `sendVerificationEmail` into the register route (already called - just ensure the import path resolves).
3. Test with a real Resend API key in dev: register a new account and confirm the email sends.

### Phase 9 - Public API routes (30 min)

1. `src/app/api/work/route.ts` - `GET /api/work` (Part 9).
2. `src/app/api/contact/route.ts` - `POST /api/contact` (Part 9).
3. Wire the `DualTrackCTA` component on the frontend to `POST /api/contact`.
4. Wire the `/work` page frontend to `GET /api/work` instead of the static `src/data/work.ts`.
5. Run `npx tsc --noEmit`.

### Phase 10 - Entity API routes (2 days)

Build in priority order per the route list in Part 10:

1. `GET/POST /api/engineers` + `GET/PUT/DELETE /api/engineers/[id]`
2. `GET/POST /api/briefs` + `GET/PUT/DELETE /api/briefs/[id]`
3. `GET/POST /api/matches` + `GET/PUT/DELETE /api/matches/[id]`
4. `GET/POST /api/placements` + `GET/PUT/DELETE /api/placements/[id]`
5. `GET/POST /api/projects` + `GET/PUT/PATCH/DELETE /api/projects/[id]`
6. `GET/POST /api/timesheets` + `GET/PUT /api/timesheets/[id]`
7. `GET/POST /api/invoices` + `GET/PUT/DELETE /api/invoices/[id]`
8. `GET /api/activity`
9. `GET/PUT /api/users/me`
10. `GET/POST /api/organizations` + `GET/PUT/DELETE /api/organizations/[id]`
11. `POST /api/upload`

### Phase 11 - Replace static data (2 days)

1. Replace `src/data/engineers.ts` static array with `GET /api/engineers` in Server Components.
2. Replace `src/data/dashboard.ts` mock entities with real DB queries per page.
3. Replace `src/data/work.ts` with `GET /api/work` on the `/work` page (done in Phase 9).
4. Add `<Suspense>` + skeleton fallbacks to all data-fetching Server Components.
5. Wire dashboard pages one by one: admin overview → briefs → matches → client overview → dev overview → inner pages.
6. Run `npx tsc --noEmit` after each page is wired.

### Phase 12 - Final verification

```bash
npx tsc --noEmit          # zero TypeScript errors
npm run lint              # only run if explicitly requested
```

---

## PART 16: SECURITY CHECKLIST

Before any route goes to production:

- [ ] All `(app)` routes protected at the server-side layout boundary via `requireSession` or `requireRole`.
- [ ] No role-sensitive data returned to wrong role from any API endpoint.
- [ ] SQL injection impossible - Drizzle uses parameterized queries by default.
- [ ] Passwords stored as bcrypt hashes only. Never logged. Never returned in API responses.
- [ ] JWT secret is minimum 64 characters. Different value in dev and prod.
- [ ] Session tokens are revokable from the DB - not purely stateless JWTs.
- [ ] Google OAuth `state` parameter validated on every callback.
- [ ] PKCE code verifier stored in HTTP-only cookie - not localStorage or sessionStorage.
- [ ] `DATABASE_URL` and `JWT_SECRET` never exposed to the client bundle. `NEXT_PUBLIC_` prefix is forbidden for these variables.
- [ ] Admin seed account never returned by any public API endpoint.
- [ ] Email enumeration prevented in login route via constant-time hash comparison.
- [ ] All API inputs validated with Zod before any DB operation.
- [ ] File uploads validated for MIME type and size before Vercel Blob write.
- [ ] Error messages never leak internal details (stack traces, table names, query structure) to clients.
- [ ] `POST /api/contact` and `GET /api/work` are public - verify no sensitive data is returned.
- [ ] `POST /api/contact` does not leak whether an email already exists in the system (upsert silently).
- [ ] Rate limiting: apply Vercel Edge rate limiting or a middleware token bucket to `POST /api/contact` to prevent spam. Target: 5 requests per IP per hour.

---

## PART 17: NEON POSTGRES SETUP GUIDE

1. Go to neon.tech → Create account → New project → Name it `andishi-v3`.
2. Select region: `eu-west-1` - closest to EAT/WAT for lowest latency on Kenyan deployments.
3. Enable **connection pooling** in the Neon project dashboard.
4. Copy the **pooled** connection string as `DATABASE_URL` in `.env.local`.
5. Copy the **direct** (non-pooled) connection string as `DATABASE_DIRECT_URL` for migrations.
6. In `drizzle.config.ts`, use `DATABASE_DIRECT_URL` for the migration step if pooling causes migration issues: `url: process.env.DATABASE_DIRECT_URL!`.
7. In `src/db/index.ts`, always use `DATABASE_URL` (pooled) for runtime queries.

### Neon-specific notes

- Neon scales to zero. Cold starts add roughly 500ms on the first query after an idle period. This is acceptable for low-traffic routes.
- Use `@neondatabase/serverless` - it uses HTTP instead of persistent TCP, which is required for Vercel serverless and edge environments.
- Connection pooling is built into Neon. Do not add PgBouncer separately.
- Run `npm run db:generate` then `npm run db:migrate` before every production deployment that includes schema changes.
- Branching: use Neon's branch feature to create a `staging` branch for pre-production schema validation. Never run migrations directly against production without testing on a branch first.

---

## PART 18: COMPLETION DEFINITION

Backend phase is complete when all of the following pass:

**Database:**
- [ ] `npm run db:migrate` runs against Neon with zero errors.
- [ ] All tables in Part 4 are present with correct columns and types.

**Auth:**
- [ ] `npm run seed:admin` creates `dennis@andishi.dev` as admin with `role = admin`, `status = active`.
- [ ] Login with `dennis@andishi.dev` credentials redirects to `/admin`.
- [ ] Google OAuth sign-in creates or links a user and redirects to the correct role workspace.
- [ ] Unauthenticated requests to `(app)` routes redirect to `/login?next=...`.
- [ ] Wrong-role requests redirect to the correct role workspace home.
- [ ] Disabled accounts see `/login?error=account_disabled`.

**Public routes:**
- [ ] `GET /api/work` returns an empty array (no error) when no public projects exist.
- [ ] `GET /api/work` returns only `isPublic = true` projects when records exist.
- [ ] `POST /api/contact` with `type: "build"` creates a brief with `briefType = "build"` and fires confirmation emails.
- [ ] `POST /api/contact` with `type: "hire"` creates a brief with `briefType = "hire"` and fires confirmation emails.
- [ ] `POST /api/contact` returns `400` for invalid payloads with a descriptive error.
- [ ] `POST /api/contact` does not expose internal error details on server failures.

**Entity routes:**
- [ ] All entity API routes return correct data scoped to the caller's role.
- [ ] Admin endpoints return `403` to client and developer callers.
- [ ] Client endpoints return only that client's own organization's data.

**Data replacement:**
- [ ] Dashboard pages fetch real data - no mock imports from `src/data/` remain in page or layout components.
- [ ] `/work` page fetches from `GET /api/work` - no static import from `src/data/work.ts`.
- [ ] `<Suspense>` and skeleton fallbacks are in place for all data-fetching Server Components.

**Email:**
- [ ] Verification email sends on registration.
- [ ] Build brief confirmation email sends when `POST /api/contact` with `type: "build"` is called.
- [ ] Hire brief confirmation email sends when `POST /api/contact` with `type: "hire"` is called.
- [ ] Admin notification email sends on every `/api/contact` submission.

**Quality:**
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] Security checklist in Part 16 is fully checked.

---

*This document is the single source of truth for all backend decisions.*
*Version 2.0 · June 2026*
*Supersedes BACKEND_ARCHITECTURE_SPEC.md v1.0 (May 2026)*
