# ADR-0006: Careers / talent-supply model (freelance, internal, outsourced)

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, Talent Ops, DevOps/Product

## Context

Careers exists only as marketing copy today — there is no page, data model, or pipeline. The business needs one admin-controlled surface to run three distinct talent-supply channels: **freelance** project work, **internal recruitment** (Andishi's own hires), and **third-party outsourcing** (placing external tech talent with clients). Each channel shares the "opening → application → pipeline → decision" shape but differs in audience, compensation, and destination.

## Decision

Model careers with `job_openings` (discriminated by `kind: freelance | internal | outsourced`, optional `org_id` for client-facing outsourced roles), `applications` (stage machine, optional link to an existing `engineers` row), `application_events` (audit/notes), and `talent_pool_entries` (supply-side pipeline per channel). A public `/careers` + `/careers/[slug]` renders published openings and captures applications, which flow into the recruiter queue in the admin dashboard. All three channels reuse the same tables and recruiter workflow, differentiated by `kind`.

## Options Considered

### Option A: Unified openings/applications with a `kind` discriminator (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Reuse | High — one pipeline, one recruiter UX |
| Flexibility | Handles all three channels + future ones |

**Pros:** One workflow and UI; consistent reporting across channels; easy to add channels. **Cons:** Some fields only apply to certain kinds (handled via nullable columns + validation).

### Option B: Separate tables per channel
**Pros:** Each channel's fields are strict. **Cons:** Triple the surface; duplicated recruiter workflow; cross-channel reporting is painful.

### Option C: Reuse `briefs`/`matches` for careers
**Pros:** No new tables. **Cons:** Conflates client demand with talent supply; overloads existing semantics; blocks clean pipelines.

## Trade-off Analysis

The three channels are variations on one recruiting workflow; a discriminated unified model maximises reuse and reporting while nullable-column + per-kind validation handles the field differences cleanly. It also links naturally into `engineers` (network) and `outsourced` placements later.

## Consequences

- **Easier:** running/reporting all supply channels from one queue; adding channels; linking applicants to the engineer network.
- **Harder:** per-kind validation and UI conditionals; keeping stage semantics coherent across channels.
- **Revisit:** whether outsourced placements should generate a `placement`/finance record automatically when hired (likely yes, in P2/P5 integration).

## Action Items
1. [ ] Add `job_openings, applications, application_events, talent_pool_entries` (+ enums).
2. [ ] Public `/careers` + `/careers/[slug]` + apply endpoint (rate-limited, persists application).
3. [ ] Recruiter queue in admin gated by `careers.*` permissions.
4. [ ] Per-`kind` validation; link applications to `engineers` where applicable.
