# ADR-0003: Internal provider-agnostic finance ledger

**Status:** Implemented (July 2, 2026)
**Date:** July 1, 2026
**Deciders:** Backend lead, Finance, DevOps/Product

## Context

Finance is a stub: only an `invoices` table exists, with no bill/pay rates, so revenue and margin cannot be computed. The ERP needs revenue, cost, margin, AR, expenses, and engineer payouts now, but a payments provider (Stripe for billing, Wise/Stripe Connect for payouts) is deferred. We must build a correct financial foundation without coupling to a provider.

## Decision

Build an **internal ledger**: `rate_cards` (bill/pay rates per engineer/client), `ledger_accounts` + `ledger_entries` + `ledger_transactions` (double-entry style), `invoice_line_items`, `expenses`, `payouts`, `budgets`. All money is integer minor units (`*_cents`) + explicit `currency`. Invoices are generated from approved timesheets/milestones; posting an invoice/expense/payout writes balanced ledger entries. Revenue/cost/margin are derived by services. Provider fields (`stripe_*`, `wise_*`) are added as nullable columns so integration is a later config/wiring change, not a reshape.

## Options Considered

### Option A: Internal ledger now, provider later (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Moderate |
| Correctness | High (auditable, balanced) |
| External deps | None yet |

**Pros:** Correct margins/AR immediately; auditable; no external account setup; clean seam for Stripe/Wise. **Cons:** We implement invoice/payout lifecycle ourselves for now.

### Option B: Integrate Stripe + Wise now
**Pros:** Real money movement sooner. **Cons:** External accounts/keys/webhooks/compliance now; still need internal records to reconcile; larger surface before core ERP is proven.

### Option C: Invoice status only (current)
**Pros:** Nothing to build. **Cons:** No revenue/cost/margin; not an ERP.

## Trade-off Analysis

Money correctness must precede automation and provider integration. A ledger is the reconciliation target any provider will need anyway, so building it first is not throwaway work - it's the foundation Stripe/Wise plug into.

## Consequences

- **Easier:** revenue/margin/AR reporting, expense and payout tracking, later provider reconciliation.
- **Harder:** we own invoice/payout state machines initially; must keep entries balanced (enforced in services + tests).
- **Revisit:** tax handling, multi-currency FX, and provider webhooks at integration time (P9).

## Action Items
1. [x] Add finance tables (rates, ledger, line items, expenses, payouts, budgets).
2. [x] Finance services: post transaction (balanced), generate invoice from time, compute revenue/cost/margin/AR.
3. [x] Invoice-generation background job per billing period.
4. [x] Unit tests for ledger balancing and margin math.

## Implementation Notes (July 2, 2026)

All four action items shipped in one pass, verified against live Neon data (12-step e2e run) plus 12 new Vitest unit tests (30 total passing repo-wide). Summary of what was actually built, and where it diverged from or extended the original decision:

- **Schema**: `src/db/schema/finance.ts` (rate_cards, ledger_accounts, ledger_entries, ledger_transactions, invoice_line_items, expenses, payouts, budgets) + `src/db/schema/jobs.ts` (`job_runs`, pulled forward from its originally-planned P8 slot since the invoice-generation job needs it now) + `invoices` extended with `subtotalCents`/`taxCents`/`source`/`ledgerTransactionId`. Migration `0005_dark_guardian.sql`. Polymorphic references (`rate_cards.subjectId`, `ledger_transactions.referenceId`, `budgets.scopeId`, `invoices.ledgerTransactionId`, `invoice_line_items.invoiceId`) are plain `uuid` columns, not FK-constrained - same convention as `activity_events.entityId`, chosen deliberately over adding FKs to avoid a circular module import between `invoices.ts` and `finance.ts`.
- **Chart of accounts**: `src/lib/services/finance/accounts.ts` - 7 accounts (AR, Cash, AP-Expenses, AP-Payouts, Service Revenue, Cost of Services, Operating Expenses), idempotently seeded via `seedChartOfAccounts()`, now wired into `scripts/seed-admin.ts` alongside the permission catalog so every environment bootstraps it automatically.
- **Ledger core**: `src/lib/services/finance/ledger.ts` - `postTransaction()` is the single write path; the debits-equal-credits invariant is `assertBalanced()`, a pure function (no DB access) so it's directly unit-tested. Every finance mutation that moves money (send invoice, approve/reimburse expense, approve/pay payout) posts through this, never writing `ledger_entries` directly.
- **Invoice generation**: one line item per engineer per time-and-materials invoice (grouped by their active "bill" rate card), one line item per fixed-price milestone. Both mark their source rows (`timesheet_entries.invoiceId` / `milestones.invoiceId`) atomically in the same transaction as invoice creation, so double-billing is structurally prevented, not just convention. Cancelling a draft invoice frees those rows back up for re-invoicing (verified live).
- **Reports**: `getFinanceSummary()` is **company-wide only**, not per-project/org - the original decision didn't specify this, and building accurate per-project cost would require time-allocation logic (a payout isn't tied to one project) that doesn't exist yet. Revenue is read from the ledger's Service Revenue account (accrual basis, i.e. what's been invoiced, not just paid), matching "sum bill" from the master doc. DSO uses ending AR as an approximation (no daily AR snapshot history yet to average over) - documented as a known simplification, not hidden.
- **Background job**: `src/lib/jobs/generate-invoices.ts`, triggered via `/api/jobs/generate-invoices` (Vercel Cron, monthly on the 1st, `vercel.json`). Runs as a "system actor" session (the seeded super_admin) since there's no interactive user - only `session.user.id`/`role` are ever read by `authorize()`, so this is a safe, minimal synthetic session rather than a new auth concept. Per-project/per-milestone failures (e.g. a missing rate card) are recorded and skipped, not fatal to the whole run. The route fails closed on a missing `CRON_SECRET` (unlike optional services such as Sentry/rate-limiting, this endpoint writes real financial records, so silent no-auth-configured behavior would be a real risk).
- **`/api/invoices` refactored** onto the service layer (was still a raw pre-service-layer route with `role === "admin"` checks and no audit trail) - `DELETE` now cancels (status transition) instead of hard-deleting, since financial records should never actually disappear.
- **Not done / explicitly deferred**: per-project/org revenue drilldowns (see reports note above); `/admin/revenue` + client `/payments` + dev `/earnings` dashboard UI still reads mock data - wiring them to these live endpoints is a distinct follow-up, consistent with how P1 Delivery/PM and the CMS backends were left on mock-data UIs after their backends shipped.
