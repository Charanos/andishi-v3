# ADR-0005: Observability (Sentry) & testing strategy

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** DevOps/Product, Backend lead

## Context

There is currently no error tracking, structured logging, tracing, health check, or automated test suite beyond `tsc --noEmit`. As the backend becomes an ERP handling money, delivery, and PII, undetected failures and regressions become business-critical. The DevOps/Product owner is responsible for tracking, testing, and integration health.

## Decision

Adopt **Sentry** (`@sentry/nextjs`) for server + client error tracking and performance tracing, with environment/release tagging, PII scrubbing, and a `requestId` attached to every server error. Add structured JSON logging (request ID, user ID, module, action), a `GET /api/health` endpoint (DB ping + build info), and `job_runs` for background-job liveness. Establish a testing pyramid: Vitest unit tests (services, `can()`/scope, finance math), integration tests for API routes against a disposable Neon branch, and Playwright E2E smoke for one critical flow per module. CI gate: typecheck + lint + test before deploy; migrations reviewed like code.

## Options Considered

### Option A: Sentry + structured logs + Vitest/Playwright pyramid (chosen)
**Pros:** Mature Next.js integration; covers errors, tracing, releases; well-understood test tooling; incremental adoption. **Cons:** Sentry cost at scale; test suite takes effort to build.

### Option B: Logs only, no error tracker
**Pros:** No vendor. **Cons:** No aggregation/alerting/release correlation; blind to production errors.

### Option C: Full OpenTelemetry + self-hosted stack
**Pros:** Vendor-neutral, powerful. **Cons:** High ops overhead; premature for current scale.

## Trade-off Analysis

Sentry gives the highest reliability-per-effort for a Next.js app and integrates in hours. The test pyramid is scoped to the highest-risk logic (authz + money) first, expanding per phase, so coverage grows with the code rather than blocking it.

## Consequences

- **Easier:** diagnosing production issues, correlating errors to releases, catching regressions in authz/finance.
- **Harder:** maintaining tests as schema evolves; keeping PII out of logs/Sentry.
- **Revisit:** sampling rates and Sentry plan at scale; adding OTel if multi-service later.

## Action Items
1. [x] Install/configure `@sentry/nextjs` (server+client), scrub PII, tag release/env.
2. [x] Structured logger + request-ID middleware; attach to error envelope.
3. [x] `GET /api/health`; `job_runs` table + wrapper (job_runs deferred to P1/P2 when the first background job ships).
4. [x] Vitest setup + first unit tests (authz `can()`/`authorize()`, 5 passing); Neon-branch integration harness and Playwright smoke deferred until P1 services exist to test against.
5. [ ] CI: typecheck + lint + test gate; migration review step.

## Addendum (July 1, 2026): dev tooling added ahead of P1

Alongside Vitest, added three more low-risk, high-value tools evaluated specifically for the growing service-layer surface:

- **Biome** (`biome.json`) as **formatter only** - `linter.enabled: false` and `assist.enabled: false` so it never overlaps with `eslint-config-next`, which owns Next.js/React-specific lint rules Biome doesn't fully replicate. Not run as a one-time repo-wide reformat (would produce a disruptive, unrelated diff); instead applied to files as they're touched, converging gradually via lint-staged.
- **`eslint-plugin-drizzle`** - enforces `.where()` on `update`/`delete` calls. A real footgun once dozens of service methods exist across delivery/finance/CRM; catching it at lint time beats catching it in production.
- **husky + lint-staged** - pre-commit hook runs Biome format + `eslint --fix` on staged files only (fast, no full-repo typecheck at commit time - that stays a CI-time gate per item 5 above).

Explicitly **not** adopted: `drizzle-zod` (would introduce a second, generated-schema validation style alongside the existing hand-rolled Zod schemas in `lib/validation/*` - a real inconsistency for no clear gain given how customized the existing schemas already are, e.g. the briefs discriminated union).
