# ADR-0003: Internal provider-agnostic finance ledger

**Status:** Accepted
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

Money correctness must precede automation and provider integration. A ledger is the reconciliation target any provider will need anyway, so building it first is not throwaway work — it's the foundation Stripe/Wise plug into.

## Consequences

- **Easier:** revenue/margin/AR reporting, expense and payout tracking, later provider reconciliation.
- **Harder:** we own invoice/payout state machines initially; must keep entries balanced (enforced in services + tests).
- **Revisit:** tax handling, multi-currency FX, and provider webhooks at integration time (P9).

## Action Items
1. [ ] Add finance tables (rates, ledger, line items, expenses, payouts, budgets).
2. [ ] Finance services: post transaction (balanced), generate invoice from time, compute revenue/cost/margin/AR.
3. [ ] Invoice-generation background job per billing period.
4. [ ] Unit tests for ledger balancing and margin math.
