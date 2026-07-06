# Andishi Backend - Architecture Decision Records

ADRs record the significant, hard-to-reverse backend decisions and the reasoning behind them. The consolidated design lives in [`../BACKEND_ARCHITECTURE_MASTER.md`](../BACKEND_ARCHITECTURE_MASTER.md); these records explain *why*.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](ADR-0001-rbac-permissions.md) | Permission-based RBAC with DB-driven custom roles & scoping | Accepted |
| [0002](ADR-0002-service-layer.md) | Introduce a service/domain layer with transactional workflows | Accepted |
| [0003](ADR-0003-finance-ledger.md) | Internal provider-agnostic finance ledger | Accepted |
| [0004](ADR-0004-cms.md) | Migrate hardcoded content to a DB-backed CMS with revisions | Accepted |
| [0005](ADR-0005-observability-testing.md) | Observability (Sentry) & testing strategy | Accepted |
| [0006](ADR-0006-careers-talent-supply.md) | Careers / talent-supply model (freelance, internal, outsourced) | Accepted |
| [0007](ADR-0007-role-interconnections.md) | Cross-role interconnection and workflow handoff model | Accepted |
| [0008](ADR-0008-caching-and-jobs.md) | Caching, rate limiting, and background job infrastructure (Upstash) | Accepted |
| [0009](ADR-0009-messaging-delivery-strategy.md) | Internal messaging & notification delivery strategy (polling first) | Accepted |
| [0010](ADR-0010-monolith-vs-separated-backend.md) | Stay unified on Next.js - defer a separated backend service | Accepted |
| [0011](ADR-0011-crm-sales.md) | CRM/Sales model (leads, deals, proposals) | Implemented |

**Status values**: Proposed · Accepted · Deprecated · Superseded.
Add a new ADR by copying the format and incrementing the number. Never edit an accepted ADR's decision in place - supersede it with a new one.
