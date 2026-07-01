# ADR-0008: Caching, rate limiting, and background job infrastructure

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

As the ERP grows past P1, three infrastructure gaps become relevant: (1) public unauthenticated endpoints have **zero brute-force/spam protection** today - confirmed by inspection, `/api/auth/login` accepts unlimited password guesses, and `/api/auth/register`, `/api/contact`, `/api/general-inquiry` accept unlimited submissions; (2) permission resolution and session lookups hit Postgres on every request, with no cross-request cache; (3) upcoming phases need scheduled/background work (P2 invoice generation runs, later SLA sweeps and payout runs).

The app deploys to Vercel as serverless Next.js functions - no persistent Node process, no long-lived in-memory state across invocations. Any caching or job infrastructure must be **serverless-native**, not a traditional persistent-connection service, for the same reason the DB driver had to be `neon-serverless` rather than a plain TCP Postgres client (see ADR-0002 addendum).

## Decision

**Rate limiting (implemented now):** [Upstash Redis](https://upstash.com) via `@upstash/redis` + `@upstash/ratelimit` - HTTP/REST-based, no persistent connections, pay-per-request, free tier covers current scale, native Vercel integration. `src/lib/rate-limit.ts` wraps this in a `rateLimit(bucket, identifier, opts)` helper that **fails open** (allows the request, logs one warning) when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` aren't set - the same pattern as Sentry's optional DSN, safe to ship before the Upstash database is provisioned. Wired into `/api/auth/login` (10/5min per IP), `/api/auth/register`, `/api/contact`, `/api/general-inquiry` (5/hour per IP each) - closing a real, pre-existing gap, not a speculative one.

**Session/permission caching (deferred):** `resolveActorPermissions()` currently hits Postgres on every authorization check, memoized only within a single request via React's `cache()`. At current traffic this is cheap (a handful of joined rows). **Not adopted now** - would add cache-invalidation complexity (must invalidate on role/permission changes) for a cost that isn't yet a real bottleneck. Revisit if request volume or DB load actually shows this as a hot path.

**Background jobs (deferred, plan set):** Vercel Cron (a `vercel.json` schedule hitting an API route) + the already-planned `job_runs` table for idempotency/tracking is sufficient for P2's invoice-generation run and future SLA/payout sweeps - no new infrastructure required. **Not adopted** (no queue like BullMQ, no orchestration platform like Inngest/Trigger.dev) until job complexity genuinely requires retries, fan-out, or multi-step workflows beyond what a single scheduled route can express.

## Options Considered

### Option A: Upstash (serverless-native) for rate limiting; Vercel Cron + Postgres for jobs; defer caching (chosen)
**Pros:** Matches the serverless deployment model exactly; closes a real security gap immediately; zero new infra for jobs until actually needed. **Cons:** Requires provisioning an external Upstash account before rate limits actually activate (fails open until then).

### Option B: Self-hosted/traditional Redis (ElastiCache, Redis Cloud TCP) + BullMQ workers
**Pros:** More powerful primitives (pub/sub, streams, full Lua scripting). **Cons:** Needs persistent TCP connections and a long-running worker process - fundamentally mismatched with Vercel serverless functions, would require standing up separate always-on infrastructure just to run a queue. Solves problems this app doesn't have yet.

### Option C: Do nothing until a real incident forces the issue
**Pros:** No effort now. **Cons:** The brute-force gap on `/api/auth/login` is a real, currently-exploitable vulnerability, not a hypothetical one - waiting for an incident is the wrong call here specifically (though it would be the right call for the deferred caching/jobs pieces).

## Trade-off Analysis

Rate limiting is the one piece of this ADR with a proven, current need (an unprotected login endpoint), so it's implemented now with the serverless-correct tool. Caching and job orchestration are real future needs but not current bottlenecks - building them now would be solving problems that don't exist yet, at the cost of operational surface area (an Upstash pub/sub setup, a queue, workers) that has to be maintained regardless of whether it's earning its keep.

## Consequences

- **Easier:** login/registration/contact endpoints are no longer trivially abusable once Upstash is provisioned; P2's invoice job has a clear, infra-free implementation path.
- **Harder:** rate limits are inert until someone creates an Upstash database and sets two env vars - this must not be forgotten before production launch.
- **Revisit:** add permission-resolution caching if DB load metrics show it's warranted; move to Inngest/Trigger.dev if job orchestration outgrows "one scheduled route per job."

## Action Items
1. [x] Install `@upstash/redis`, `@upstash/ratelimit`; build `src/lib/rate-limit.ts` (fail-open pattern).
2. [x] Wire rate limiting into `/api/auth/login`, `/api/auth/register`, `/api/contact`, `/api/general-inquiry`.
3. [x] Add `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` placeholders to `.env.local`.
4. [ ] Provision an actual Upstash database and set the env vars in local + Vercel production before launch (external account creation - user action, not code).
5. [ ] P2: implement invoice-generation job as a Vercel Cron route + `job_runs` tracking (no new infra).
