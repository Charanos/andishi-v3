# ADR-0009: Internal messaging & notification delivery strategy

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

P8 (Support & Notifications) plans `support_cases`, `support_messages`, `notifications`, and `notification_prefs` tables, and the frontend already has a `FloatingSupportChat` component and an admin notification bell/badge (both currently mock). Before P8 is built, the *delivery mechanism* needs to be decided: how do new messages and notifications actually reach a connected client - push, or poll?

This matters architecturally because Vercel serverless functions are stateless and short-lived: they cannot hold a persistent WebSocket connection, and Server-Sent Events (SSE) are workable but constrained by function execution-time limits, making them awkward to rely on as the primary mechanism without additional platform-specific tuning.

## Decision

**Start with polling, backed by Postgres - no new infrastructure.** Notification bell/badge polls `GET /api/notifications` on a moderate interval (15-20s is plenty for an internal ops tool; nobody needs sub-second badge updates). An open support case thread polls its messages endpoint on a shorter interval only while the panel is actually visible/focused (5-8s), pausing when backgrounded. This is honest about what this system actually is: an internal ERP used by a small team, not a consumer chat product - the latency polling introduces (single-digit seconds) is very unlikely to matter in practice.

**Defined upgrade path, not built yet:** if real usage proves polling insufficient (support agents specifically complaining about chat lag is the expected trigger, not notifications - nobody needs instant badge counts), upgrade **support chat specifically** first, via one of:
- A managed realtime provider (Ably or Pusher - trivial integration, generous free tiers, offloads the hard part of holding connections)
- SSE from a Next.js Edge Runtime route, if staying fully in-house (workable on Vercel, unlike persistent WebSockets)
- Upstash Redis pub/sub if already paying for Upstash by then (ADR-0008) and want to keep everything on one provider

**What is explicitly rejected for now:** running a dedicated always-on WebSocket server. That would be the "correct" answer for true realtime at any scale, but it means standing up and operating a persistent service outside Vercel's serverless model for a need that polling likely already satisfies - the definition of solving a problem before it exists.

## Options Considered

### Option A: Polling now, managed realtime or SSE later if proven necessary (chosen)
**Pros:** Zero new infrastructure; ships with P8 immediately; correctly sized for actual internal-tool usage patterns. **Cons:** Not instant - a genuine trade-off, not a hidden one.

### Option B: Build SSE or WebSocket support into P8 from day one
**Pros:** "Real" realtime immediately. **Cons:** Solves a problem not yet proven to exist; SSE fights Vercel's function-duration model, WebSockets require infrastructure this app doesn't have and doesn't need for anything else yet.

### Option C: Adopt a managed realtime provider (Ably/Pusher) for everything now
**Pros:** Best UX immediately, no infra to run. **Cons:** A new paid third-party dependency and account to manage before there's evidence it's needed; premature commitment to a specific vendor before P8 even exists.

## Trade-off Analysis

The cost of starting with polling is a few seconds of latency on notifications and chat - genuinely unnoticeable for an internal ops tool's actual usage pattern. The cost of building realtime infrastructure now is real engineering and operational effort spent on a need that hasn't been demonstrated. Option A defers that cost until it's proven necessary, with a clear, specific, low-effort upgrade path already identified (not "figure it out later" - "use Ably/Pusher for chat specifically, or SSE if staying in-house").

## Consequences

- **Easier:** P8 ships without any new infrastructure decisions blocking it; the upgrade path is already scoped so it's a contained addition later, not a redesign.
- **Harder:** none of this is "real" realtime - if usage patterns turn out to need it sooner than expected, that's a follow-up piece of work, not free.
- **Revisit:** if support agents report chat lag as a real complaint (the expected first trigger), or if usage volume grows enough that polling itself becomes a meaningful load concern.

## Action Items
1. [ ] P8: build `notifications`/`support_messages` polling endpoints with sensible intervals (15-20s notifications, 5-8s active chat panel only).
2. [ ] Document the Ably/Pusher/SSE upgrade path in the P8 implementation notes when that phase starts, so it isn't re-litigated from scratch.
3. [ ] No infrastructure action needed now - this ADR is a decision record, not an implementation task, until P8 begins.
