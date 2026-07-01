# Andishi Backend — Architecture Decision Records

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

**Status values**: Proposed · Accepted · Deprecated · Superseded.
Add a new ADR by copying the format and incrementing the number. Never edit an accepted ADR's decision in place — supersede it with a new one.
