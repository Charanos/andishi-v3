# Andishi v3 - Dashboard Phase Claude Code Prompt

Paste this as your opening message to Claude Code to begin the dashboard implementation phase.

---

## PROMPT

You are implementing the dashboard phase of **Andishi v3** - a senior African developer talent platform. The public marketing and auth pages are complete. Your task is to build three role-scoped operational workspaces: Super Admin (`/admin`), Client (`/dashboard`), and Developer (`/dev`).

**Your single source of truth is `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`.** Read it in full before touching any file. Every decision, component spec, data model, execution order, and design rule is in that document.

---

### Context

- **Repo**: `https://github.com/Charanos/andishi-v3.git`
- **Current admin status**: auth/shell foundation and the admin overview are already substantially implemented. Continue from the current code: fixed/collapsible desktop sidebar, five-link mobile bottom nav plus drawer, floating top nav, calendar/notification/quick-action/account popovers, Recharts metrics, event CRUD panel, and pipeline detail modals.
- **Stack**: Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4 · Framer Motion · next-themes · `@tabler/icons-react`
- **Verification gate**: `npx tsc --noEmit` only - do NOT run production builds unless explicitly asked
- **Design language**: established by the public marketing pages - cosmic editorial, restrained glass, CSS token system in `globals.css`, `cosmicSpring` from `src/lib/motion.ts`
- **Dashboard scaffolds**: already exist under `src/app/(app)/` - refine, don't replace

---

### Execution order

Run in this exact sequence from `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` Part 10:

**Phase 1 - Auth foundation**
1. Create `src/types/auth.ts` - `AuthUser`, `UserRole`, `roleHome`
2. Create `src/types/entities.ts` - all entity interfaces from Part 7
3. Implement session utilities - `getSession()`, `requireRole()`, redirect helper
4. Wire `src/app/(app)/layout.tsx` - server-side auth guard, role redirect
5. Wire `/login` form action - credentials → session → `roleHome[role]` redirect
6. Create `scripts/seed-admin.ts` - idempotent seed for `dennis@andishi.dev` / `dennis-andishi@123` with role `admin`
7. Run `npm run seed:admin` and verify login → `/admin`

**Phase 2 - Shell upgrade**
1. Refine `AppShell` - accept `AuthUser` prop, mobile drawer via context
2. Refine `RoleSidebar` - mobile overlay drawer, active route, role card, sign out
3. Refine `DashboardTopNav` - breadcrumbs, `NotificationMenu`, `AccountMenu`
4. Build new primitives: `RoleGate`, `DashboardPageHeader`, `DashboardSection`, `ToastProvider`, `ConfirmDialog`, `AccountMenu`, `NotificationMenu`, `CommandMenu` (admin only)

**Phase 3 - Admin dashboard** (all routes in `/admin`)
**Phase 4 - Client dashboard** (all routes in `/dashboard`)
**Phase 5 - Developer dashboard** (all routes in `/dev`)
**Phase 6 - Integrations** (Crisp, GA4, Stripe placeholder)
**Phase 7 - QA** (`tsc`, lint, visual QA, accessibility)

---

### Critical rules - enforce on every file you touch

1. **No `font-bold` or `font-semibold`** - use `font-medium` for labels/buttons, `font-normal` for body
2. **`font-mono` for all numbers** - IDs, money, timestamps, percentages, durations
3. **`@tabler/icons-react` only** - no Lucide, no Heroicons
4. **Mobile-first** - every component at 375px before 768px before 1280px+
5. **No purple** - all colours from CSS tokens in `globals.css`
6. **Auth at server boundary** - role checks in `(app)/layout.tsx` or server utilities, not only in client components
7. **No nested glass cards** - one level of glass surface depth
8. **Framer Motion springs**: `{ type: "spring", damping: 25, stiffness: 200 }` for all UI transitions
9. **No `font-bold` or `font-semibold`** (mentioned twice because it breaks often)
10. **Crisp for messaging** - do NOT build custom WebSocket chat

---

### Seed admin target

| Field | Value |
|---|---|
| Email | `dennis@andishi.dev` |
| Role | `admin` |
| Status | `active` |
| Redirect | `/admin` |

Store only a password hash. Make the seed idempotent.

---

### Definition of done

Before handing back, verify:
- `dennis@andishi.dev` logs in and reaches `/admin`
- Client login reaches `/dashboard`
- Developer login reaches `/dev`
- Wrong-role routes redirect silently to correct workspace
- Unauthenticated `(app)` routes redirect to `/login?next=...`
- `npx tsc --noEmit` passes with zero errors
- Shell responsive at 375px, 768px, 1280px, 1440px - both dark and light themes

Start with Phase 1. Read `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` first.
