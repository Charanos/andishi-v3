# ADR-0011: CRM/Sales model (leads, deals, proposals)

**Status:** Implemented (July 2, 2026)
**Date:** July 2, 2026
**Deciders:** Backend lead, Sales, DevOps/Product

## Context

Every public intake surface (`/api/contact`, `/api/general-inquiry`) had its own inconsistent, non-CRM way of remembering an inbound inquiry: `/api/contact` created a guest organization/user/brief immediately with no upstream funnel record, while `/api/general-inquiry` only logged an `activity_events` row with no persistent, queryable record at all. Neither was a `lead` in any CRM sense, and there was no `deals`/`proposals` pipeline for sales to run qualification, scoping, and close activity through. ADR-0007's flow map already named `sales_manager` as CRM's owner and described the exact handoff (`lead` → qualifies → `brief`), but the `leads` table it depends on didn't exist yet.

## Decision

Add `leads`, `deals`, `proposals`, `deal_activities` (master doc §6.3). Every public intake route now calls a single `recordIntakeLead()` write path instead of each inventing its own mechanism. Self-qualifying submissions (the full `/start-project` wizard) still create their brief immediately for continuity, but now also create/link a lead so funnel/source-attribution reporting is possible; less-qualified submissions (the short `/contact` form) create an unqualified lead only, left for a `sales_manager` to qualify and convert via a new `convertLeadToBrief` action. `deals`/`proposals` implement a standard stage pipeline (qualification → scoping → proposal_sent → negotiation → won/lost) with the obvious cross-entity effects (sending a proposal advances an early-stage deal; accepting a proposal wins its deal) automated, and marking anything "lost" requires a reason.

## Options Considered

### Option A: Unified `leads` write path + staff-driven qualify/convert pipeline (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Consistency | High — one intake mechanism for every current and future form |
| Data quality | High — every inquiry is now a real, reportable row |

**Pros:** Closes the exact inconsistency found in the July 2 intake audit; matches ADR-0007's already-documented flow; low schema risk (additive tables only). **Cons:** `/api/contact`'s auto-brief-creation and the lead's qualification state can diverge slightly for self-qualifying submissions (mitigated by linking `convertedToBriefId` and setting `status: "qualified"` at creation time, not leaving it ambiguous).

### Option B: Only fix `/api/general-inquiry`, leave `/api/contact` as-is
**Pros:** Smaller change. **Cons:** Leaves two different intake shapes permanently, the exact problem being fixed; no funnel visibility for the wizard's much higher submission volume.

### Option C: Make every submission go through manual lead qualification (no auto-brief-creation for anyone)
**Pros:** Architecturally "pure" per ADR-0007's flow map. **Cons:** Regresses the `/start-project` wizard's already-verified, working auto-brief flow for no concrete benefit — a multi-step wizard submission is self-qualifying in practice; forcing a manual conversion step here would only slow down real client intake.

## Trade-off Analysis

The real gap wasn't the *existence* of brief auto-creation for qualified submissions — it was the *absence* of any CRM-level record for the other, less-structured intake paths, and the lack of a shared write path that made the two mechanisms diverge in the first place. Option A fixes both without touching the parts of the existing flow that already work correctly.

## Consequences

- **Easier:** every inbound inquiry is now visible to `sales_manager` in one place (`GET /api/leads`); source attribution (`start_project` vs `contact` vs `hire` vs future `campaign`/`referral`) is now real data, not inferred; deal/proposal state changes are auditable and their cross-entity effects (proposal accepted → deal won) can't be forgotten by a human.
- **Harder:** two ways a lead becomes "qualified" now exist (automatic via `/api/contact`, manual via `convertLeadToBrief`) - documented clearly in code comments so it doesn't read as an inconsistency later.
- **Revisit:** `talent_pool_entries` / hire-track lead volume once a real hire-intake frontend form exists (currently `briefType: "hire"` is fully supported end-to-end in the backend but has no live frontend caller - `/api/contact`'s hire branch is dead code from the frontend's perspective, same gap noted for `hireContactSchema` before this ADR).

## Action Items
1. [x] Add `leads`, `deals`, `proposals`, `deal_activities` (+ enums). `leads` also gets a `convertedToBriefId` column beyond the master doc's minimal spec, for a traceable lead→brief link instead of fuzzy email/org correlation.
2. [x] `/api/contact` and `/api/general-inquiry` persist a lead (keeping existing email notifications) instead of their prior inconsistent mechanisms.
3. [x] `convertLeadToBrief` service action + `POST /api/leads/[id]/convert` for staff-driven qualification of leads that didn't arrive via a self-qualifying form.
4. [x] Deals/proposals pipeline with stage-transition rules (lost requires a reason; proposal-sent only advances an early-stage deal, never regresses one already further along; proposal-accepted auto-wins its deal).
5. [x] Live end-to-end verification (11-step run against real Neon data, plus a direct HTTP smoke test of both intake routes) - no dedicated Vitest unit tests, since (like testimonials/careers) this module's logic is CRUD + branching rather than the kind of derived computation (ledger balance, project health) that P1/P2 extracted into pure, unit-tested functions.
