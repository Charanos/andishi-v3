# ADR-0002: Introduce a service/domain layer with transactional workflows

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

Business logic currently lives in route handlers. Workflows that span multiple tables — accept match → create placement → open project → seed billing schedule; approve timesheet → roll into invoice → post ledger entries — are not atomic, not reusable (a background job can't invoke them), and duplicate authorization/audit logic. As the ERP grows this becomes unmaintainable and risks data integrity.

## Decision

Introduce a **service layer** (`lib/services/<module>`) that owns all domain workflows. Routes become thin: authenticate, validate (Zod), call a service with a caller context, format the response. Services own DB **transactions**, call `can()` for authorization, and emit audit + activity + notifications through shared helpers. A thin repository layer (`lib/repositories`) may wrap common queries; Drizzle relations are added for relational reads.

## Options Considered

### Option A: Dedicated service layer (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Moderate refactor |
| Scalability | High — logic reused by routes, jobs, admin |
| Maintainability | High |

**Pros:** Atomic workflows; single place for authz+audit; testable without HTTP; reusable by jobs. **Cons:** More files/indirection; migration effort for existing routes.

### Option B: Keep logic in routes, extract helpers ad hoc
**Pros:** Less structure to learn. **Cons:** Transactions and authz stay inconsistent; jobs can't reuse logic; testing needs HTTP.

## Trade-off Analysis

The indirection cost is small relative to the correctness and reuse benefits once money and multi-step workflows exist. Testing services directly (no HTTP) materially speeds up the finance/PM correctness work.

## Consequences

- **Easier:** transactional correctness, unit testing, invoking workflows from jobs, consistent audit.
- **Harder:** one more layer to navigate; discipline required to keep routes thin.
- **Revisit:** whether repositories are worth the extra layer per module (start thin, promote only where reused).

## Action Items
1. [x] Create `lib/services/` skeleton + caller-context type.
2. [x] Add `db.transaction` helper conventions + audit/activity/notification emit helpers.
3. [ ] Add `src/db/relations.ts` for relational queries.
4. [x] Refactor briefs/projects routes onto services as the reference pattern.

## Addendum (July 1, 2026): DB driver swap required for real transactions

While implementing P0, discovered that `src/db/index.ts` used `drizzle-orm/neon-http` (`neon()` HTTP fetch client), which **throws `"No transactions support in neon-http driver"` at runtime** — confirmed by reading `node_modules/drizzle-orm/neon-http/session.js`. This directly broke the premise of this ADR and ADR-0003's balanced-ledger writes, both of which require interactive `BEGIN/COMMIT` transactions (e.g. read unbilled timesheets → sum → insert invoice + line items, all atomically).

`db.batch()` (neon-http's own atomic-multi-statement mechanism) was considered and rejected: it requires every query in the batch to be fully constructed upfront, so it cannot express read-then-conditionally-write chains where a later statement depends on a value read earlier in the same unit — exactly the shape of the finance and delivery workflows this ADR exists to make atomic.

**Fix applied:** switched `src/db/index.ts` to `drizzle-orm/neon-serverless` (`Pool` from `@neondatabase/serverless`, WebSocket transport via the `ws` package). This is Neon's own recommended driver for serverless apps that need real transactions, still targets the same pooled `DATABASE_URL`, and required no other route changes since `getDb()`'s return shape is structurally identical. Verified with a real `db.transaction()` round-trip against the live Neon database (see commit introducing this file). `tsc --noEmit` stayed clean throughout.

No action needed elsewhere — this was caught and fixed before any service code shipped on top of the broken assumption.
