# ADR-0010: Stay unified on Next.js - defer a separated backend service

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

The question raised: should Andishi split into a separate backend service (e.g. a NestJS API) in its own repository, deployed independently from the Next.js frontend - the classic "frontend app + backend service" architecture - or continue as a single Next.js application handling both the public site, the dashboards, and the API routes in one codebase and one deployment?

Terminology note: what exists today (one Next.js codebase serving pages and API routes) is itself "a monolith" in the standard sense - a single deployable unit. The question is really *whether to split that monolith into two services*, not whether to introduce one.

## Decision

**Stay unified on Next.js. Do not split into a separate backend now.** Three concrete, observable trigger conditions are defined below for when to revisit - this is a deferral with clear criteria, not an indefinite refusal.

### Why staying unified is correct right now

1. **The service layer is already framework-agnostic and split-ready.** `src/lib/services/`, `src/lib/authz/`, `src/lib/validation/`, and `src/db/` contain zero Next.js-specific imports (no `NextRequest`/`NextResponse` inside them) - only the thin `src/app/api/*/route.ts` handlers touch Next.js's HTTP layer. This was a deliberate outcome of ADR-0002's route-vs-service separation, not an accident. It means a *future* extraction would be a mechanical move of already-correct business logic into a new HTTP adapter, not a rewrite of the logic itself.
2. **NestJS's core value propositions are already solved by hand.** Dependency injection, guards, and module boundaries are NestJS's headline features - but this codebase already has equivalent primitives: `authorize()`/`can()` (≈ guards), `src/lib/services/<module>/` (≈ modules), and plain function imports (≈ DI, without the ceremony). Adopting NestJS now would mean learning and maintaining a second framework's conventions to re-obtain capabilities that already exist.
3. **Splitting has real, immediate costs with no current corresponding benefit.** It would mean: porting 40+ existing API routes to a new framework; standing up cross-service authentication (does the Next.js frontend call the NestJS API via shared session cookies across domains, or a Bearer token, or something else - a real design problem with no existing need to solve it); two deployments, two CI pipelines, two sets of secrets; and materially slower iteration for a small team. None of the usual reasons to split - a second consumer app, independent team ownership, workloads that don't fit serverless, scaling one side independent of the other - are present today.
4. **Every infrastructure gap surfaced in ADR-0008 and ADR-0009 is solvable without a separate backend.** Rate limiting (Upstash), background jobs (Vercel Cron), even future realtime messaging (managed provider or SSE) - none of them require abandoning the serverless Next.js model.

### Concrete trigger conditions for revisiting

Split when **any** of these becomes true, not before:

1. A **second consumer** (a mobile app, a partner/third-party integration) needs the API independent of the Next.js frontend, and duplicating auth/business logic into that consumer isn't acceptable.
2. A workload genuinely **cannot run in serverless functions** - e.g. a persistent WebSocket server becomes necessary because the ADR-0009 upgrade path (managed realtime, SSE) proves insufficient, not just theoretically less elegant.
3. The team grows to include **dedicated backend engineers** who would benefit from an independent repo, deploy cadence, and on-call boundary separate from frontend work.
4. **Vercel-specific constraints** (function duration, cold starts, cost model at scale) become a proven bottleneck that a dedicated backend runtime would solve - not a theoretical concern.

### What a future split would actually look like

Because of point 1 above, the extraction path is already clear: move `src/lib/services/`, `src/lib/authz/`, `src/lib/validation/`, and `src/db/` into a new repository (or a monorepo workspace via pnpm/Turborepo, if sharing TypeScript types with the frontend remains valuable), then write a thin controller/route layer in whatever framework is chosen at that time (NestJS, Express, Fastify, or another Next.js instance acting as a pure API) that calls the exact same service functions. **No separate git repo is needed today** - this becomes a "when triggered" action, not a "set up now, migrate later" one, since setting up an empty second repo/deployment ahead of an actual split buys nothing.

## Options Considered

### Option A: Stay unified on Next.js, defer splitting with explicit triggers (chosen)
**Pros:** Zero migration cost now; velocity stays high; the architecture is already positioned for a cheap future split if needed. **Cons:** None of NestJS's ecosystem/conventions are available if the team specifically wants them for their own sake (not for a functional gap).

### Option B: Split into a separate NestJS (or similar) backend now
**Pros:** "Proper" separation some teams prefer by default; independent scaling/deployment from day one. **Cons:** Large migration cost, new cross-service auth problem to solve, doubled operational surface, for zero functional requirement currently in evidence. Solves organizational problems (team boundaries) that don't exist yet at this team size.

### Option C: Split only the API routes into a separate Next.js app (no framework change), keep it in the same monorepo
**Pros:** Smaller step than Option B - no NestJS learning curve. **Cons:** Still incurs the cross-service auth and dual-deployment costs of Option B for a smaller ergonomic gain; doesn't solve anything Option A doesn't already solve via the existing service-layer separation.

## Trade-off Analysis

The entire cost of Option A is deferred optionality - if a trigger condition is hit, there's migration work to do then, which there would have been regardless. The entire cost of Option B is paid immediately, for problems (team scaling, independent deployment, non-serverless workloads) that don't currently exist. Given the layered architecture already makes a future split cheap, waiting for a real trigger is the correct call, not a compromise.

## Consequences

- **Easier:** every phase (P2 onward) continues to ship in one codebase, one deploy, one CI pipeline, with the fastest possible iteration loop.
- **Harder:** none, relative to the current baseline - this preserves the status quo rather than introducing new complexity.
- **Revisit:** the moment any of the four trigger conditions above becomes concretely true, not preemptively.

## Action Items
1. [x] Document the decision and trigger conditions (this ADR).
2. [ ] No code or infrastructure changes required - this is a "do not do X yet" decision, re-evaluated only when a trigger condition fires.
