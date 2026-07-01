# ADR-0004: Migrate hardcoded content to a DB-backed CMS with revisions

**Status:** Accepted
**Date:** July 1, 2026
**Deciders:** Backend lead, Content, DevOps/Product

## Context

Blog posts, case studies (`/work`), services, and skill domains are hardcoded in `src/data/*.ts`. Publishing requires a code change and deploy. The admin dashboard must provide CRUD for this content (blogs, projects/case studies especially), including draft/publish and version history, so non-engineers can manage the public site.

## Decision

Move content into DB tables: `blog_posts`, `services_content`, `skill_domains`, `content_authors`, and reuse the `projects` table (with its existing `isPublic`/`publicSlug`/case-study fields) for case studies — adding editorial `status` and a shared `content_revisions` table for version history. Public pages **dual-read**: DB first, falling back to `src/data/*` until each table is seeded and verified, then the static fallback is removed. Admin CRUD is gated by `cms.*` permissions.

## Options Considered

### Option A: Own DB-backed CMS tables + revisions (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Moderate (tables + admin editors + seed) |
| Control | Full (matches our schema/design system) |
| Fit | Tight with existing projects/case-study fields |

**Pros:** No external service; content matches our exact shapes; draft/publish + revisions; reuses `projects` for case studies. **Cons:** We build the editing UX and seed/cutover.

### Option B: External headless CMS (Sanity/Contentful)
**Pros:** Rich editor out of the box. **Cons:** New vendor, cost, auth, and sync; splits content ownership; overkill for current volume.

### Option C: Keep content in `src/data/*.ts`
**Pros:** Zero work. **Cons:** No admin CRUD — fails the requirement.

## Trade-off Analysis

Content volume is modest and shapes are already well-defined in `src/data/*.ts`, so an in-house CMS is low-risk and avoids vendor coupling. Dual-read guarantees no regression during migration.

## Consequences

- **Easier:** publishing without deploys; editorial workflow; SEO field management.
- **Harder:** we build editors and maintain seed/cutover; must handle Markdown/rich text rendering safely.
- **Revisit:** move to a headless CMS only if editorial volume/complexity outgrows the in-house editor.

## Action Items
1. [ ] Add `blog_posts, services_content, skill_domains, content_authors, content_revisions`.
2. [ ] `seed-cms` script importing current `src/data/*.ts`.
3. [ ] Public pages dual-read (DB → static fallback).
4. [ ] Admin CRUD editors gated by `cms.*` permissions; write revisions on save.
