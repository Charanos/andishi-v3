# ADR-0001: Permission-based RBAC with DB-driven custom roles & scoping

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, DevOps/Product

## Context

The current model has three role strings (`admin | client | developer`) checked inline (`session.user.role === "admin"`) across ~28 routes. The pivot turns the admin dashboard into an internal ERP where staff have distinct, non-overlapping responsibilities: finance must not touch matching, a PM must not see payroll, a content editor must not manage placements. Three roles cannot express this, and inline checks make authorization logic impossible to audit or evolve.

## Decision

Adopt **permission-based RBAC**. Permissions (`<module>.<resource>.<action>`) are a seeded catalog; roles are DB rows mapping to permissions; users are assigned roles, optionally scoped to a team/department/org. Authorization is evaluated by a central `can(user, permission, resource?)` in `lib/authz`, enforced in the **service layer**. The `users.role` column is retained only as the route-group router (`/admin`, `/dashboard`, `/dev`) and coarse persona, not as the capability source.

## Options Considered

### Option A: Permission-based RBAC with custom roles (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med-High |
| Cost | Higher upfront (catalog, resolver, tables) |
| Scalability | Excellent - new capabilities are data, not code |
| Team familiarity | Standard pattern |

**Pros:** Expresses every ERP persona; custom roles without deploys; central, auditable enforcement; supports scoping.
**Cons:** More upfront schema + resolver work; must seed and maintain the catalog.

### Option B: Fixed expanded role set with static permission maps
**Pros:** Simpler; no admin UI for roles. **Cons:** Every new capability/role is a code change; scoping still ad-hoc; re-work when flexibility is needed.

### Option C: Keep 3 roles, defer
**Pros:** Fastest now. **Cons:** Guarantees a disruptive refactor once finance/PM/marketing staff are onboarded; blocks the ERP.

## Trade-off Analysis

The ERP requirement makes flexible, scoped authorization a core capability, not a nice-to-have. Option A's upfront cost is paid once; Options B/C defer a larger cost into a period when more code depends on the wrong model. Scoping (self / team / owning-org) also cleanly subsumes the existing client/developer ownership rules, removing per-route special casing.

## Consequences

- **Easier:** onboarding staff personas, auditing "who can do what," reusing authz in jobs and admin actions.
- **Harder:** initial setup; every mutating service must call `can()` + write audit.
- **Revisit:** permission granularity (avoid over-fragmentation); a role-management admin UI (P0/P1); caching of permission resolution under load.

## Action Items
1. [x] Add tables: `permissions, roles, role_permissions, user_roles, teams, team_members`.
2. [x] Seed permission catalog + system roles (`super_admin, finance_manager, delivery_pm, recruiter, marketer, content_editor, support_agent`).
3. [x] Implement `lib/authz/can()` + scope resolution + request-scoped cache.
4. [x] Add `authorize()` route/service guard; migrate 2 existing routes (briefs, projects) as the reference.
5. [x] Write `audit_log` on every write/delete/approve.

## P0 completion notes (July 1, 2026)

Implemented and verified end-to-end against the live Neon database (`scripts/seed-admin.ts` → `scripts/seed-permissions.ts` shared logic in `src/lib/authz/seed.ts`):

- 87 permissions seeded across 10 modules; 7 system roles with intentionally non-overlapping permission sets (e.g. `marketer` does not get CMS write access - see catalog.ts comments for the reasoning).
- `dennis@andishi.dev` correctly holds `super_admin` with all 87 permissions.
- Verified both the allow-path (`super_admin` passes `crm.brief.read`/`delivery.project.read`) and, critically, the **deny-path**: a role-stripped admin-persona user is genuinely rejected with `ForbiddenError`, not silently passed. Client/developer ownership-scoping (not permission-based) verified working alongside it.
- `super_admin` has no code-level bypass - it holds every catalog permission as real `role_permissions` rows, so authorization stays fully data-driven per the original decision.
