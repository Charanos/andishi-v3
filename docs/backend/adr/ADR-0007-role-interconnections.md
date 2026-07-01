# ADR-0007: Cross-role interconnection and workflow handoff model

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

ADR-0001 established permission-based RBAC with 7 non-overlapping system roles. Non-overlapping *write* access is correct - it's the whole point of moving off 3 coarse roles. But a system of precisely separated roles that cannot see across their own boundary isn't an ERP, it's seven filing cabinets. Andishi's actual operation is one continuous flow - a lead becomes a brief becomes a project becomes billable time becomes an invoice becomes a payout - and it crosses department boundaries constantly. Two concrete gaps proved this wasn't yet handled:

1. **No role owned CRM.** `crm.lead.write` / `crm.brief.write` / `crm.deal.write` were granted to nobody but `super_admin`, despite the backend master doc's own module map (Part 5) naming "sales" as CRM's owning team. Every lead and every client brief would have had to go through the founder.
2. **The activity feed had no real staff visibility model.** `src/app/api/activity/route.ts` special-cased `session.user.role === "admin"` to return *every* event unfiltered, regardless of `visibleTo`. Once finance/recruiter/marketer/etc. staff exist (all still carrying `users.role = "admin"` for routing purposes), they would all see everything - the exact silo-vs-everything-open failure mode this ADR exists to avoid.

Beyond those two, a systematic pass over every real handoff in the business (below) found several read-permissions that were simply missing, and one case of a resource assigned to the wrong role entirely (matching/placement).

## Decision

1. **Add an 8th system role, `sales_manager`**, owning the CRM module (`crm.*`) - lead qualification, deals, proposals, brief intake for both the build and hire tracks.
2. **Move matching/placement ownership from `delivery_pm` to `recruiter`.** Deciding who fits a brief and formalizing a placement is a talent-ops judgment call, not a delivery-execution one. `delivery_pm` keeps read-only visibility (`delivery.match.read`, `delivery.placement.read`) because a placement often spawns the project they'll actually run.
3. **Add the missing cross-module read grants** identified by the flow map below (finance needs milestone/placement/engineer visibility to bill correctly; delivery needs invoice visibility to know if a client is paid; recruiter needs payout visibility for retention; content needs project visibility to write case studies; support needs invoice/project visibility to resolve cases; marketing needs job-opening visibility to promote roles; sales needs project/engineer/invoice/campaign visibility to manage accounts).
4. **Replace the activity feed's blanket admin bypass with a three-tier, permission-driven visibility model**, using the same `resolveActorPermissions()` that already powers `can()`:
   - `"client"` / `"developer"` - unchanged ownership-tag semantics (org/engineer match).
   - `"admin"` - broadly visible to any staff member, for genuinely company-wide events.
   - a `PermissionKey` (e.g. `"finance.invoice.read"`) - visible only to staff holding that exact permission.

   A shared `emitActivityEvent()` helper (`src/lib/services/activity.ts`) is now the single insertion point going forward, so visibility stays typed and consistent instead of scattered string-array literals.

## The end-to-end flow map this was derived from

**Build track (primary):**
`lead` (marketer's campaign or public form) → `sales_manager` qualifies → `brief` (build) → `sales_manager` scopes via `deal`/`proposal` → **handoff:** `delivery_pm` promotes the brief into a `project` → tasks/sprints/milestones execute → engineer logs `timesheet_entries` → `delivery_pm` approves → **handoff:** `finance_manager` reads approved time/milestones → generates `invoice` → client pays → **handoff:** `finance_manager` runs engineer `payout` from the same approved time. `content_editor` later reads the completed project to write a case study. `support_agent` reads project/invoice state to resolve client questions about either.

**Hire / talent-supply track (secondary):**
`lead` (intended_track=hire) → `sales_manager` → `brief` (hire) → **handoff:** `recruiter` proposes `match`es against the engineer network → formalizes a `placement` → **handoff:** this can spawn a `project` shell for ongoing time/billing, which `delivery_pm` then runs and `finance_manager` bills exactly as above.

**Careers (freelance / internal / outsourced):**
`recruiter` publishes a `job_opening` → **handoff:** `marketer` promotes it → public `application` comes in → `recruiter` progresses it → on internal hire, **handoff:** `recruiter` cannot provision a user account themselves (`identity.user.write` stays `super_admin`-only, a deliberate separation of duties between "who we're hiring" and "who gets system access") - they flag it and `super_admin` provisions. On freelance/outsourced hire, `recruiter` creates the `engineers` profile directly (they already hold `talent.engineer.write`).

**Marketing/CMS:**
`marketer` runs a `campaign` → generates `lead`s (source-attributed) → **handoff:** `sales_manager` reads campaign context to understand where a lead came from. `content_editor` owns CMS writes independently; `marketer` gets read-only CMS visibility to promote what's published, not to publish it themselves.

## Options Considered

### Option A: Corrected role model + permission-driven activity visibility (chosen)
**Pros:** Every cross-boundary read is traceable to a real handoff (documented above, and in code comments in `catalog.ts`); activity feed respects the same boundaries as API authorization instead of a parallel, weaker model. **Cons:** More permissions per role to reason about than a purely siloed model.

### Option B: Keep roles strictly siloed, no cross-module reads at all
**Pros:** Maximally simple mental model. **Cons:** Unworkable in practice - finance literally cannot bill without seeing delivery's approved time; support cannot resolve a case without seeing the account it's about. This is what "precise but disconnected" would produce.

### Option C: Grant broad admin-persona visibility (the old activity.ts behavior) and rely on the UI to hide irrelevant sections
**Pros:** Simple to build. **Cons:** Security/precision theater - the permission model would be cosmetic if every admin-persona user can already see everything at the data layer regardless of role.

## Trade-off Analysis

The cost of Option A is a slightly longer permission list per role and the discipline to justify every addition (enforced going forward via the comment in `catalog.ts` above `SYSTEM_ROLES`). That cost is small next to what Option B or C would have produced: either an ERP where departments can't actually do their jobs, or one where role separation is fictional at the data layer. Deriving every grant from an explicit, written flow (this document) means the permission set can be audited against real business process, not vibes.

## Consequences

- **Easier:** onboarding a new staff persona now means checking this document for their real handoffs, not guessing; the activity feed is now a legitimate department-scoped feed, not a firehose.
- **Harder:** every future cross-module read addition needs the same justification discipline - this is intentional friction.
- **Revisit:** whether `team`-scoped role assignments (e.g. two delivery_pms each scoped to their own team) need the activity visibility resolver to also account for `teamScoped` grants, not just `global` ones - deferred until team-scoped assignments are actually used (currently all system roles are `scopeType: "global"`).

## Action Items
1. [x] Add `sales_manager` role owning `crm.*` plus justified cross-module reads.
2. [x] Move `delivery.match.write`/`delivery.placement.write` from `delivery_pm` to `recruiter`; `delivery_pm` keeps read-only.
3. [x] Add missing cross-module reads: `finance_manager` (milestone, placement, engineer), `delivery_pm` (invoice), `recruiter` (payout), `content_editor` (project), `support_agent` (invoice, project), `marketer` (job openings).
4. [x] Rebuild `src/app/api/activity/route.ts` staff-visibility resolution on `resolveActorPermissions()` instead of a blanket admin bypass.
5. [x] Add `src/lib/services/activity.ts` (`emitActivityEvent`) as the typed, single insertion point; migrate `briefs.ts` to it as the reference.
6. [ ] Migrate the remaining pre-service-layer routes (`engineers`, `contact`, `briefs/[id]`, `projects/[id]`, `matches`) off raw `visibleTo: ["admin"]` literals as each is moved onto the service layer in its own phase - not done as a standalone sweep.
7. [ ] Re-seed and verify against the live database (roles, permissions, and activity visibility filtering).
