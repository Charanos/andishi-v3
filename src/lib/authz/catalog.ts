/**
 * Canonical permission catalog and system role definitions for Andishi's
 * permission-based RBAC (ADR-0001). This file is the single source of truth:
 * `scripts/seed-permissions.ts` seeds the DB from it, and `PermissionKey`
 * gives every `can()`/`authorize()` call compile-time checking.
 *
 * Naming: "<module>.<resource>.<action>". Actions are one of:
 * read | write | delete | approve | verify | publish | assign | export.
 *
 * There is no code-level "super admin bypass" - `super_admin` is granted
 * every permission explicitly at seed time so authorization stays fully
 * data-driven and auditable.
 */

export const PERMISSION_MODULES = [
  "identity",
  "crm",
  "delivery",
  "finance",
  "talent",
  "careers",
  "marketing",
  "cms",
  "support",
  "scheduling",
  "platform",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export interface PermissionDefinition {
  key: string;
  module: PermissionModule;
  resource: string;
  action: string;
  description: string;
}

function perm(
  module: PermissionModule,
  resource: string,
  action: string,
  description: string,
): PermissionDefinition {
  return { key: `${module}.${resource}.${action}`, module, resource, action, description };
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  // ── Identity & Access ──────────────────────────────────────────
  perm("identity", "user", "read", "View staff and workspace user accounts"),
  perm("identity", "user", "write", "Create, invite, and update staff and workspace user accounts"),
  perm("identity", "user", "disable", "Disable or re-enable a user account"),
  perm("identity", "role", "read", "View roles and their permission assignments"),
  perm("identity", "role", "write", "Create custom roles and assign permissions to users"),
  perm("identity", "team", "read", "View teams and their membership"),
  perm("identity", "team", "write", "Create teams and manage team membership"),

  // ── CRM / Sales ──────────────────────────────────────────────────
  perm("crm", "lead", "read", "View inbound leads and source attribution"),
  perm("crm", "lead", "write", "Create, qualify, and update leads"),
  perm("crm", "lead", "delete", "Delete or merge duplicate leads"),
  perm("crm", "deal", "read", "View the sales pipeline"),
  perm("crm", "deal", "write", "Create and progress deals"),
  perm("crm", "proposal", "read", "View proposals"),
  perm("crm", "proposal", "write", "Draft and send proposals"),
  perm("crm", "brief", "read", "View client build/hire briefs"),
  perm("crm", "brief", "write", "Create and update briefs"),
  perm("crm", "brief", "delete", "Archive or delete a brief"),

  // ── Delivery / PM ──────────────────────────────────────────────
  perm("delivery", "project", "read", "View projects"),
  perm("delivery", "project", "write", "Create and update projects"),
  perm("delivery", "project", "delete", "Delete a project"),
  perm("delivery", "project", "publish", "Publish or unpublish a project as a public case study"),
  perm("delivery", "task", "read", "View tasks"),
  perm("delivery", "task", "write", "Create, assign, and update tasks"),
  perm("delivery", "task", "delete", "Delete a task"),
  perm("delivery", "sprint", "read", "View sprints"),
  perm("delivery", "sprint", "write", "Open, close, and manage sprints"),
  perm("delivery", "milestone", "read", "View milestones"),
  perm("delivery", "milestone", "write", "Create and update milestones"),
  perm("delivery", "milestone", "approve", "Approve a submitted milestone"),
  perm("delivery", "allocation", "read", "View engineer capacity/allocation plans"),
  perm("delivery", "allocation", "write", "Plan engineer capacity/allocation"),
  perm("delivery", "timesheet", "read", "View logged time"),
  perm("delivery", "timesheet", "write", "Log or edit time entries"),
  perm("delivery", "timesheet", "approve", "Approve or reject submitted time entries"),
  perm("delivery", "match", "read", "View the brief-to-engineer matching pipeline"),
  perm("delivery", "match", "write", "Propose and progress matches"),
  perm("delivery", "placement", "read", "View placements"),
  perm("delivery", "placement", "write", "Create and update placements"),
  perm("delivery", "message", "read", "View a project's internal message thread"),
  perm("delivery", "message", "write", "Post to a project's internal message thread"),

  // ── Finance ──────────────────────────────────────────────────────
  perm("finance", "rate", "read", "View bill/pay rate cards"),
  perm("finance", "rate", "write", "Set bill/pay rate cards"),
  perm("finance", "invoice", "read", "View invoices"),
  perm("finance", "invoice", "write", "Create and edit invoices"),
  perm("finance", "invoice", "approve", "Approve, send, or void an invoice"),
  perm("finance", "expense", "read", "View expenses"),
  perm("finance", "expense", "write", "Record expenses"),
  perm("finance", "expense", "approve", "Approve or reject an expense"),
  perm("finance", "payout", "read", "View engineer payouts"),
  perm("finance", "payout", "write", "Create a payout run"),
  perm("finance", "payout", "approve", "Approve a payout for settlement"),
  perm("finance", "ledger", "read", "View the ledger and journal entries"),
  perm("finance", "budget", "read", "View budgets"),
  perm("finance", "budget", "write", "Set and adjust budgets"),
  perm("finance", "report", "export", "Export revenue, margin, and AR reports"),

  // ── Talent / People Ops ──────────────────────────────────────────
  perm("talent", "engineer", "read", "View engineer network profiles"),
  perm("talent", "engineer", "write", "Create and edit engineer profiles"),
  perm("talent", "engineer", "verify", "Mark an engineer as vetted/verified"),
  perm("talent", "skill", "read", "View the skills taxonomy"),
  perm("talent", "skill", "write", "Manage the skills taxonomy"),
  perm("talent", "vetting", "read", "View vetting stage history"),
  perm("talent", "vetting", "write", "Record vetting stage decisions"),
  perm("talent", "availability", "write", "Update engineer availability windows"),

  // ── Careers / Talent Supply ──────────────────────────────────────
  perm("careers", "job", "read", "View job openings across all supply channels"),
  perm("careers", "job", "write", "Create and edit job openings"),
  perm("careers", "job", "publish", "Publish or close a job opening"),
  perm("careers", "application", "read", "View applications"),
  perm("careers", "application", "write", "Progress an application through its pipeline"),

  // ── Marketing ──────────────────────────────────────────────────
  perm("marketing", "campaign", "read", "View marketing campaigns"),
  perm("marketing", "campaign", "write", "Create and manage campaigns"),
  perm("marketing", "newsletter", "read", "View newsletter subscribers"),
  perm("marketing", "newsletter", "write", "Manage newsletter subscribers and sends"),

  // ── CMS ──────────────────────────────────────────────────────────
  perm("cms", "blog", "read", "View blog posts, including drafts"),
  perm("cms", "blog", "write", "Create and edit blog posts"),
  perm("cms", "blog", "publish", "Publish, schedule, or archive a blog post"),
  perm("cms", "case_study", "write", "Edit case study editorial content on a project"),
  perm("cms", "service", "write", "Edit public service line content"),
  perm("cms", "skill_domain", "write", "Edit public skill domain content"),
  perm("cms", "testimonial", "write", "Create and edit client/engineer testimonials"),
  perm("cms", "faq", "write", "Edit FAQ entries across public sections"),

  // ── Support ──────────────────────────────────────────────────────
  perm("support", "case", "read", "View support cases"),
  perm("support", "case", "write", "Update or resolve a support case"),
  perm("support", "case", "assign", "Assign a support case to an agent"),
  perm("support", "message", "write", "Reply within a support case thread"),

  // ── Scheduling ───────────────────────────────────────────────────
  // Organizing your own meetings/RSVPing needs no permission (self-scoped -
  // see lib/services/scheduling/events.ts); these gate staff-wide calendar
  // visibility and creating events on behalf of the org.
  perm("scheduling", "event", "read", "View the full scheduling calendar across staff"),
  perm("scheduling", "event", "write", "Create and manage calendar events (interviews, calls)"),

  // ── Platform ─────────────────────────────────────────────────────
  perm("platform", "settings", "read", "View platform settings"),
  perm("platform", "settings", "write", "Change platform settings"),
  perm("platform", "audit", "read", "View the immutable audit log"),
  perm("platform", "integration", "write", "Configure third-party integrations"),
  perm("platform", "job", "read", "View background job run history"),
  perm("platform", "governance", "read", "View governance/compliance controls"),
  perm("platform", "governance", "write", "Create, update, and archive governance/compliance controls"),
];

export type PermissionKey = (typeof PERMISSION_CATALOG)[number]["key"];

function keysFor(
  module: PermissionModule,
  filter?: (p: PermissionDefinition) => boolean,
): PermissionKey[] {
  return PERMISSION_CATALOG.filter((p) => p.module === module && (!filter || filter(p))).map(
    (p) => p.key,
  );
}

export interface SystemRoleDefinition {
  slug: string;
  name: string;
  description: string;
  scopeType: "global" | "team" | "self";
  permissions: PermissionKey[];
}

/**
 * Seeded, non-deletable system roles. Admins may compose additional custom
 * roles from PERMISSION_CATALOG at runtime (identity.role.write) - this list
 * is the day-one baseline, not an exhaustive final set.
 *
 * Every role below owns one module outright (no two roles share a *write*
 * permission - see ADR-0001) and additionally carries a small, explicitly
 * justified set of cross-module *read* permissions. Those reads are not
 * incidental - they exist because Andishi's actual operating flow crosses
 * module boundaries constantly (a brief becomes a project, approved time
 * becomes an invoice, a hired applicant becomes an engineer). Every read
 * grant below corresponds to a specific handoff in that flow - see
 * ADR-0007 (docs/backend/adr/ADR-0007-role-interconnections.md) for the
 * full end-to-end map this was derived from. Do not add a cross-module
 * read without a real handoff to justify it - that is how role precision
 * erodes back into "everyone can see everything."
 */
export const SYSTEM_ROLES: SystemRoleDefinition[] = [
  {
    slug: "super_admin",
    name: "Super Admin",
    description: "Full operational control across every module.",
    scopeType: "global",
    permissions: PERMISSION_CATALOG.map((p) => p.key),
  },
  {
    slug: "sales_manager",
    name: "Sales Manager",
    description:
      "Owns the CRM: lead qualification, deals, proposals, and brief intake for both the build and hire tracks.",
    scopeType: "global",
    permissions: [
      ...keysFor("crm"),
      // Account health context for accounts they're managing.
      "delivery.project.read",
      // To propose team-extension/hire deals against real availability.
      "talent.engineer.read",
      // Billing status of the accounts they own.
      "finance.invoice.read",
      // Attribution: which campaign a lead came from.
      "marketing.campaign.read",
      // Scheduling client calls/intro slots is a routine part of running deals.
      ...keysFor("scheduling"),
    ],
  },
  {
    slug: "finance_manager",
    name: "Finance Manager",
    description: "Owns rates, invoicing, expenses, payouts, and revenue reporting.",
    scopeType: "global",
    permissions: [
      ...keysFor("finance"),
      // Budget/rate context when a build brief becomes a project.
      "crm.lead.read",
      "delivery.project.read",
      // Source of truth for time-and-materials invoicing.
      "delivery.timesheet.read",
      // Source of truth for fixed-price milestone invoicing.
      "delivery.milestone.read",
      // Ongoing team-extension engagements that need recurring billing.
      "delivery.placement.read",
      // To set up an engineer's pay rate card, finance needs to know who they are.
      "talent.engineer.read",
    ],
  },
  {
    slug: "delivery_pm",
    name: "Delivery PM",
    description: "Runs project delivery: tasks, sprints, milestones, and time approval.",
    scopeType: "global",
    permissions: [
      // Everything in the delivery module EXCEPT match/placement writes -
      // those are a talent-ops decision (who fits, who gets placed), owned
      // by recruiter below. Delivery_pm's job starts once a project (or a
      // placement that spawns one) is real work to execute.
      ...keysFor("delivery", (p) => p.resource !== "match" && p.resource !== "placement"),
      "delivery.match.read",
      "delivery.placement.read",
      // Context on the intake artifact that became their project.
      "crm.lead.read",
      "crm.brief.read",
      // Capacity planning needs to see who's available.
      "talent.engineer.read",
      // Is this project's client paid up - should work continue?
      "finance.invoice.read",
      // Scheduling project syncs/client check-ins.
      ...keysFor("scheduling"),
    ],
  },
  {
    slug: "recruiter",
    name: "Recruiter / Talent Ops",
    description:
      "Owns the engineer network, vetting, and all careers/talent-supply channels, plus the matching " +
      "and placement pipeline - deciding who fits a brief and formalizing the engagement.",
    scopeType: "global",
    permissions: [
      ...keysFor("talent"),
      ...keysFor("careers"),
      // Matching/placement ownership: recruiter proposes and formalizes,
      // not delivery_pm (see delivery_pm's comment above).
      "delivery.match.write",
      "delivery.placement.write",
      "crm.lead.read",
      // Engineer payment status matters for network retention.
      "finance.payout.read",
      // Scheduling interviews and intro calls is the core of this role.
      ...keysFor("scheduling"),
    ],
  },
  {
    slug: "marketer",
    name: "Marketer",
    description:
      "Owns campaigns and newsletter growth, with read visibility into leads and content. " +
      "Does not own CMS writes by default - assign content_editor alongside this role for staff who also publish.",
    scopeType: "global",
    permissions: [
      ...keysFor("marketing"),
      "crm.lead.read",
      "cms.blog.read",
      // Promoting open roles ("we're hiring") is a real marketing activity.
      "careers.job.read",
    ],
  },
  {
    slug: "content_editor",
    name: "Content Editor",
    description:
      "Owns the public-site CMS: blog, case studies, services, skills, testimonials, FAQs.",
    scopeType: "global",
    permissions: [
      ...keysFor("cms"),
      // Case studies are written about real delivered projects - the
      // source material lives in delivery, not in CMS.
      "delivery.project.read",
    ],
  },
  {
    slug: "support_agent",
    name: "Support Agent",
    description: "Resolves client and developer support cases.",
    scopeType: "global",
    permissions: [
      ...keysFor("support"),
      "identity.user.read",
      "crm.lead.read",
      // Resolving "my invoice is wrong" or "what's my project status"
      // requires being able to look the account up, not just the case.
      "finance.invoice.read",
      "delivery.project.read",
      // Scheduling support calls with clients/developers.
      ...keysFor("scheduling"),
    ],
  },
];
