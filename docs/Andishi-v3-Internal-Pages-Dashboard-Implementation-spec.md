# Andishi v3 — Internal Pages & Dashboard Implementation Spec

**Version**: 1.0 | **Date**: May 2026
**Source audit**: `docs/V3_CURRENT_STATE_AUDIT.md`
**Stack**: Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4 · Framer Motion · next-themes · @tabler/icons-react

---

## AGENT INSTRUCTIONS

Read the full document before touching a file. This spec covers two parallel workstreams:

1. **Public marketing pages** — the remaining routes from the audit's recommended page map
2. **Dashboard system** — three role-scoped workspaces (Super Admin, Client, Developer) built on a shared app shell

Execute Part A (public pages) before Part B (dashboards). The dashboards depend on the route structure being stable.

---

## PART A: PUBLIC PAGE COMPLETION

### A.1 Full Route Map (Current + New)

```
/ (implemented)
├── /services (implemented — talent-first)
├── /work (implemented — engineer proof)
├── /about (implemented)
├── /contact (implemented)
├── /start-project (implemented — legacy name, keep for now)
├── /login (implemented)
│
├── /hire                          ← NEW — canonical hiring process + guarantees
│   └── /hire/faq                  ← NEW — expanded buyer FAQ for AI extraction
│
├── /engineers                     ← NEW — talent directory + profile grid
│   └── /engineers/[slug]          ← NEW — individual engineer profile
│
├── /skills                        ← NEW — skill-domain hub (SEO + internal linking)
│   ├── /skills/fullstack          ← NEW (HIGH priority)
│   ├── /skills/ai                 ← NEW (HIGH priority)
│   ├── /skills/web3               ← NEW (MEDIUM)
│   └── /skills/aws                ← NEW (MEDIUM)
│
├── /studio                        ← NEW — secondary studio arm, separated
│
├── /blog                          ← NEW — authority + AI-search content hub
│   ├── /blog/[slug]               ← dynamic post
│   └── /blog/category/[slug]      ← category archive
│
├── /work/[slug]                   ← NEW — individual case study (extend /work)
│
├── /legal
│   ├── /legal/privacy
│   └── /legal/terms
│
├── /sitemap.xml (implemented)
├── /not-found.tsx (implemented)
└── /loading.tsx (implemented)

/* Machine-readable at /public root */
├── /llms.txt (implemented)
├── /engineers.md                  ← NEW
└── /pricing.md                    ← NEW
```

---

### A.2 /hire — Canonical Hiring Process Page

**Purpose**: Remove ambiguity from `/start-project`. This is the SEO-primary "how hiring works" page. All nav and homepage CTAs route here first, `/start-project` is the conversion form downstream.

**Page sections** (in order):

1. **Hero** (compact, not full-viewport)
   - H1: `How hiring an Andishi engineer actually works.`
   - Subheadline: `No recruiter calls, no marketplace filtering, no junior-heavy team padding. A direct path to a senior engineer matched to your stack and timeline.`
   - CTA: `Submit a Hiring Brief →` → `/start-project`

2. **Process timeline** (5 steps, horizontal desktop / vertical mobile)
   - Step 1: `Submit a brief` — 10-minute form. Role, stack, timeline, engagement model.
   - Step 2: `We shortlist` — Our team reviews the brief and hand-selects 2–4 engineers from the network. No algorithmic spray.
   - Step 3: `You review profiles` — Profiles with technical assessments, past work, timezone, and rate land in your workspace within 8 days.
   - Step 4: `Intro call` — 30-minute video call with your shortlisted engineer(s). Technical depth, not a sales pitch.
   - Step 5: `Onboard and ship` — Contract signed, workspace access granted, first sprint scoped. Most teams have code committed in week one.

3. **Guarantees section** (3-card bento, glassmorphic, `glow-blue`)
   - Card A: `8-day average` — From brief submission to first profile in your workspace. JetBrains Mono value, large.
   - Card B: `Senior only` — Every engineer in the Andishi network has 5+ years of demonstrable production experience and has passed our technical assessment.
   - Card C: `Replacement guarantee` — If an engagement isn't working within the first 30 days, we replace the engineer at no additional cost.

4. **Engagement models** (3 options, card grid)
   - `Project-based` — Scoped deliverable, fixed timeline. Best for MVPs, specific feature builds, integration work.
   - `Embedded` — Engineer joins your team as a long-term collaborator. Works in your sprints, your comms, your stack.
   - `Team extension` — 2–5 engineers deployed together. For scale-ups that need burst capacity on a defined workstream.

5. **Who it's for** (ICP callout, 2-col split desktop)
   - Left: "For startups" — Seed to Series B teams that need senior engineering capacity without the 4-month hiring cycle.
   - Right: "For scale-ups" — Engineering leads who need specialist capacity (AI, Web3, cloud) without building an internal team for it.

6. **FAQ teaser** — 3 questions pulled from `/hire/faq`, with "See all questions →" link

7. **Final CTA** — `Submit your brief. First profiles in 8 days.` + amber button

**Schema**: `HowTo` (5-step process) + `FAQPage` (for the teaser questions) + `BreadcrumbList`

---

### A.3 /hire/faq — Expanded FAQ

**Purpose**: Deep buyer objection page. Structured for AI extraction (ChatGPT, Perplexity, Google AI Overviews). Every Q&A is a standalone extraction unit.

**Minimum 12 Q&As**, covering:

- Process: timeline, what happens after brief, how matching works
- Quality: how engineers are vetted, what "senior" means here, acceptance rate
- Engagement: contract structure, how billing works, cancellation
- Practical: timezone, communication, what tools engineers work in
- Risk: replacement guarantee details, what if it doesn't work out
- Technical: skill coverage, specialisms, team composition

**Schema**: `FAQPage` with all Q&As as `mainEntity` entries. Each answer must work as a standalone 60–100 word extraction without the question.

**Layout**: Left column sticky ToC (anchor links to Q sections) + right column Q&A accordion. Mobile: accordion only, no ToC.

---

### A.4 /engineers — Talent Directory

**Purpose**: Proof page + SEO asset. Indexed by search engines. Each card is a trust signal. Feeds `/engineers/[slug]` for individual profiles.

**Page hero** (compact):

- H1: `The engineers startups choose first.`
- Subheadline: `Senior pre-vetted engineers across full-stack, AI, cloud, Web3, and mobile. Available for embedded engagements and project-based work.`
- CTA: `Tell us what you need →` → `/start-project`

**Filter bar** (sticky on scroll, mobile-first chip layout):

- Role: All · Full-Stack · Frontend · Backend · AI/ML · Cloud/AWS · Web3 · Mobile
- Availability: All / Available now
- Search: text input, `IconSearch` stroke=1.5

**Engineer card grid** (3-col desktop / 2-col tablet / 1-col mobile):

Each `EngineerCard`:

```
Avatar (diverse, high-quality, WebP)
Name + Role (e.g. "Senior Backend Engineer")
[X yrs] — JetBrains Mono badge
Skill tags (3–5 max)
Location: [City, Country] — with flag emoji or country code
Timezone: UTC+[X] (overlaps EU / US East)
Availability dot: green "Available" / amber "From [date]"
[Request Intro →] — ghost CTA, visible on hover
```

Cards link to `/engineers/[slug]`.

**Data source**: Initially static JSON at `src/data/engineers.ts`. Shape:

```ts
interface Engineer {
  slug: string;
  name: string;
  role: string;
  yearsExp: number;
  skills: string[]; // max 8
  location: { city: string; country: string; utcOffset: number };
  availability: "now" | string; // string = ISO date
  bio: string; // 2–3 sentences
  highlights: string[]; // 3 achievement bullets
  assessment: {
    systemDesign: boolean;
    codeReview: boolean;
    architectureChallenge: boolean;
  };
  githubUrl?: string;
  portfolioUrl?: string;
  featured: boolean;
}
```

**Pagination**: Load 12, "Load more" button (no page reload). Featured engineers appear first.

**Schema per card**: `Person` schema in page JSON-LD `@graph` for featured engineers. `ItemList` wrapping the directory.

---

### A.5 /engineers/[slug] — Individual Profile

**Purpose**: Deep trust-builder. Gives buyers enough to decide on an intro call. Gives engineers a professional profile in the network.

**Layout** (desktop: 3-col sidebar + main + right rail / mobile: single column):

**Left sidebar** (sticky):

- Avatar (large, 120px)
- Name + role
- Availability badge
- Timezone + location
- Skill tags (full list)
- [Request Intro →] amber CTA button
- [Back to all engineers ←] ghost link

**Main column**:

1. Bio (2–3 paragraphs, first-person voice)
2. Work history timeline (company/project + role + duration)
3. Technical highlights (3 achievement cards with metric if available)
4. Open-source / portfolio links (GitHub, live projects)

**Right rail**:

- Andishi vetting badges:
  - ✓ System Design Interview
  - ✓ Live Code Review
  - ✓ Architecture Challenge
  - ✓ Reference Checked
- Engagement types: Available for Embedded / Project-based / Team extension chips
- "Similar engineers" — 3 mini-cards

**Schema**: `Person` with `jobTitle`, `knowsAbout`, `memberOf` (Andishi network), `sameAs` (GitHub/portfolio), `BreadcrumbList`

---

### A.6 /skills/[domain] — Skill Domain Pages

Four pages: `/skills/fullstack`, `/skills/ai`, `/skills/web3`, `/skills/aws`

Each follows the same template. Build as `src/app/skills/[domain]/page.tsx` with a data file at `src/data/skills/[domain].ts`.

**Template sections**:

1. **Hero** — Domain-specific H1 (e.g. `Senior Full-Stack Engineers, Ready to Embed.`), 2-line subheadline with key technologies named, 2 CTAs
2. **What these engineers build** — 4 specific use-case cards
3. **Core technologies** — Logo/tag grid (actual tech stack)
4. **Why Andishi for [domain]** — 3-point differentiator block (network depth, vetting, timezone)
5. **3 engineer teasers** — filtered from the engineer directory, linking to full profiles
6. **Domain FAQ** — 4–6 questions specific to that skill area
7. **CTA** — `Brief us on your [domain] need →`

**Schema**: `Service` (per domain) + `FAQPage` + `BreadcrumbList`

**Internal linking**: Each skill page links to its relevant engineer profiles. Engineer profiles link back to their skill domain page.

---

### A.7 /studio — Studio Arm (Separated)

**Purpose**: Remove studio from primary talent narrative. Give it its own space so `/services` can evolve fully into a talent-services page.

**Framing**: "Andishi Studio is the build arm of the Andishi network. Our engineers build for African businesses the same way they build for global startups — with the same technical bar and the same sprint cadence."

**Sections**:

1. Hero: `We build for African businesses too.`
2. Studio services (4 cards: Web apps, E-commerce, Conversion sites, Digital systems — copy pulled from existing landing-page-content doc)
3. How studio works (process: brief → sprint → ship, 3-step)
4. Featured studio work (2–3 projects from `/work`)
5. CTA → `/contact`

**Note**: `/services` remains as-is for now. Add a "Looking for our studio work?" link at bottom of `/services` pointing to `/studio`. Future: redirect `/services` to either `/hire` or keep as talent-services hub.

---

### A.8 /blog — Content Hub

**Route structure**:

```
/blog                          → index (featured + grid)
/blog/[slug]                   → individual post
/blog/category/[slug]          → category archive
```

**Blog index layout**:

- Featured post hero (large card, full-width, image, title, excerpt, CTA)
- Category filter chips (All · Hiring · African Tech · Remote Work · Engineering)
- Post grid (3-col desktop / 1-col mobile)

**Post card**:

- Cover image (WebP, 16:9, lazy-loaded)
- Category chip
- Title (h3, font-normal)
- Excerpt (2 lines, text-secondary)
- Author avatar + name + read time
- `Read →` link

**Post page layout**:

- H1 + author + date + read time + category
- Cover image
- Body content (MDX)
- Internal CTAs (mid-article and end)
- Author bio box
- Related posts (3 cards)
- Newsletter subscribe box

**Schema per post**: `BlogPosting` with `headline`, `author`, `datePublished`, `dateModified`, `image`, `publisher`, `mainEntityOfPage`, `BreadcrumbList`

**Data source**: MDX files at `src/content/blog/[slug].mdx`. Frontmatter:

```yaml
title: string
slug: string
category: string
excerpt: string
coverImage: string
author: { name: string; role: string; avatarUrl: string }
datePublished: ISO date string
dateModified: ISO date string
readTime: number
featured: boolean
```

---

### A.9 Machine-Readable Files

**`/public/engineers.md`**:

```markdown
# Andishi Engineer Network

Andishi maintains a network of 50+ senior, pre-vetted engineers across Africa.
Engineers are placed with global startups and scale-ups as embedded team members
or project-based contributors.

## Skill Coverage

- Full-Stack: React, Next.js, Node.js, Python, Go
- AI/ML: LLMs, RAG systems, computer vision, data pipelines
- Cloud/AWS: EC2, Lambda, ECS, RDS, Terraform, CDK
- Web3/Blockchain: Solidity, EVM, DeFi protocols, NFT platforms
- Mobile: React Native, Flutter, Swift, Kotlin
- Backend/API: PostgreSQL, MongoDB, Redis, GraphQL, REST

## Availability

Engineers are available for:

- Embedded engagements (long-term, sprint-based)
- Project-based work (scoped deliverable, fixed timeline)
- Team extension (2–5 engineers on a workstream)

## How to hire

Submit a brief at https://www.andishi.dev/start-project
Browse engineers at https://www.andishi.dev/engineers
```

**`/public/pricing.md`**:

```markdown
# Andishi Engagement Pricing

Andishi does not publish fixed day-rates. Engagements are priced after a
brief conversation about role requirements, seniority level, stack, and
engagement duration.

## Indicative ranges (USD, remote)

| Engagement type                     | Senior engineer | Lead engineer  |
| ----------------------------------- | --------------- | -------------- |
| Project-based (per sprint)          | $3,000–$6,000   | $5,000–$9,000  |
| Embedded monthly                    | $6,000–$10,000  | $9,000–$16,000 |
| Team extension (per engineer/month) | $5,000–$9,000   | $8,000–$14,000 |

Ranges reflect seniority, specialisation, and engagement length.
All engagements include a 30-day replacement guarantee.
No upfront retainer required.

## How to get a quote

Submit a brief at https://www.andishi.dev/start-project
Response within 24 hours.
```

---

### A.10 Structured Data — Full Site JSON-LD Map

Implement all JSON-LD server-side using Next.js `generateMetadata` and inline `<script type="application/ld+json">` in each page's head.

| Route               | Schema types                                                 |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | `Organization` + `WebSite` + `SiteLinksSearchBox`            |
| `/hire`             | `HowTo` (5 steps) + `FAQPage` (teaser Qs) + `BreadcrumbList` |
| `/hire/faq`         | `FAQPage` (full 12+ Q&As) + `BreadcrumbList`                 |
| `/engineers`        | `ItemList` + `BreadcrumbList`                                |
| `/engineers/[slug]` | `Person` + `BreadcrumbList`                                  |
| `/skills/[domain]`  | `Service` + `FAQPage` + `BreadcrumbList`                     |
| `/work`             | `ItemList` + `BreadcrumbList`                                |
| `/work/[slug]`      | `Article` + `Review` (client quote) + `BreadcrumbList`       |
| `/blog`             | `Blog` + `BreadcrumbList`                                    |
| `/blog/[slug]`      | `BlogPosting` + `BreadcrumbList`                             |
| `/studio`           | `Service` + `BreadcrumbList`                                 |
| `/about`            | `AboutPage` + `Person` (founder) + `Organization`            |
| `/contact`          | `ContactPage` + `BreadcrumbList`                             |

---

## PART B: DASHBOARD SYSTEM

### B.1 Architecture Overview

Three role-scoped dashboards sharing one App Shell. Built inside the existing Next.js App Router structure under a protected route group.

**Auth flow**: `/login` → role-check → redirect to correct dashboard root

- Super Admin → `/admin`
- Client → `/dashboard`
- Developer → `/dev`

**Route group structure**:

```
src/app/
├── (public)/              ← marketing site (no auth)
│   └── [...all public routes]
│
└── (app)/                 ← auth-protected, shared shell
    ├── layout.tsx          ← AppShell: TopNav + RoleSidebar + main
    │
    ├── admin/              ← Super Admin workspace
    │   ├── page.tsx         → /admin (overview)
    │   ├── engineers/       → /admin/engineers
    │   ├── clients/         → /admin/clients
    │   ├── placements/      → /admin/placements
    │   ├── briefs/          → /admin/briefs
    │   ├── matches/         → /admin/matches
    │   ├── revenue/         → /admin/revenue
    │   ├── content/         → /admin/content
    │   └── settings/        → /admin/settings
    │
    ├── dashboard/          ← Client workspace
    │   ├── page.tsx         → /dashboard (overview)
    │   ├── brief/           → /dashboard/brief
    │   ├── matches/         → /dashboard/matches
    │   ├── team/            → /dashboard/team
    │   ├── projects/        → /dashboard/projects
    │   ├── messages/        → /dashboard/messages
    │   ├── payments/        → /dashboard/payments
    │   └── settings/        → /dashboard/settings
    │
    └── dev/                ← Developer workspace
        ├── page.tsx         → /dev (overview)
        ├── profile/         → /dev/profile
        ├── projects/        → /dev/projects
        ├── time/            → /dev/time
        ├── earnings/        → /dev/earnings
        ├── messages/        → /dev/messages
        └── settings/        → /dev/settings
```

---

### B.2 Shared App Shell

**File**: `src/app/(app)/layout.tsx`

```tsx
{
  children;
}
```

**Sidebar behaviour**:

- Desktop: collapsible (icon-only at 52px / full at 220px). State in `localStorage`.
- Mobile: hidden by default, slide-in overlay on hamburger tap.
- Single-open accordion groups. State managed by `SidebarProvider` context.
- Active route: `border-l-2 border-primary bg-primary/10 text-primary`.
- Collapsed state: icon only, `title` attr for tooltip on hover.

**DashboardTopNav**:

- Left: breadcrumb of current route
- Right: notifications bell + user avatar dropdown (Profile / Settings / Sign out)
- Theme toggle (sun/moon)

**Color tokens for app shell** (same as marketing site, no purple):

```css
--sidebar-bg: var(--color-bg-surface); /* #0C1220 dark / #FFFFFF light */
--sidebar-border: var(--color-border-subtle);
--nav-active-bg: var(--color-primary-muted); /* rgba(0,102,255,0.10) */
--nav-active-text: var(--color-primary);
--topnav-bg: var(--color-bg-elevated);
```

---

### B.3 Super Admin Dashboard (`/admin`)

The Andishi operator view. Full platform visibility and management.

#### B.3.1 Navigation

```
/admin                    Overview
/admin/briefs             Hiring Briefs
/admin/matches            Match Pipeline
/admin/engineers          Engineer Network
/admin/clients            Clients
/admin/placements         Active Placements
/admin/revenue            Revenue
/admin/content            Content (blog, case studies)
/admin/settings           Platform Settings
```

Sidebar groups:

- **Operations**: Overview · Briefs · Matches · Placements
- **People**: Engineers · Clients
- **Business**: Revenue · Content
- **System**: Settings

#### B.3.2 /admin — Overview

**Page title**: `Platform Overview`

**Top KPI row** (4 InsightsCards):

```
Active Placements    |  Open Briefs    |  Engineers (Network)  |  Monthly Revenue
[N]                  |  [N]            |  [N]                  |  $[X]
vs last month trend  |  [N] unmatched  |  [N] available        |  vs last month
```

All values: JetBrains Mono. Icon wrapper: `bg-primary/10`. Sparkline below each.

**Match pipeline** (Kanban-style, horizontal scroll on mobile):

```
Columns: Brief Received | Shortlisting | Profiles Sent | Intro Scheduled | Placement Active | Closed
```

Each card: client name, role, date received, assigned engineer (if matched), days in stage.

**Recent activity feed** (right sidebar on desktop, below pipeline on mobile):
Timestamped events: "New brief from Payd (Series A)", "Engineer Amara K. matched to Stackflow", "Placement #24 extended 3 months"

**Quick actions** (top-right, dropdown):

- Add engineer to network
- Create manual match
- Send placement report

#### B.3.3 /admin/briefs — Hiring Briefs

**Layout**: Filter bar + table

**Filters** (top): Status chips (All / New / In Review / Matched / Closed) + search + date range

**Table columns**:

```
Company | Role | Seniority | Stack | Submitted | Status | Assigned | Actions
```

**Row actions**: View brief · Assign engineer · Mark matched · Archive

**Brief detail drawer** (slide-in from right, not a new page):

- Full brief content
- Company info
- Recommended engineers (auto-suggested by role/stack)
- Manual match input
- Internal notes

#### B.3.4 /admin/matches — Match Pipeline

**Layout**: Kanban board (same as overview but expanded)

Clicking a card opens the brief detail drawer with match history tab.

**Above board**: 3 stats — Avg days to match, Match acceptance rate, Active pipeline value (estimated monthly revenue if all close)

#### B.3.5 /admin/engineers — Engineer Network

**Layout**: Filter bar + card grid (same visual as public `/engineers` but with admin actions)

**Admin-only fields per card**:

- Internal rating (1–5 stars, admin-only)
- Placement history count
- Availability notes (internal)
- Vetting status badge (Fully Vetted / Pending Assessment / Under Review)

**Engineer actions**: Edit profile · Toggle availability · View placement history · Send to brief

**Add engineer flow** (modal, 4 steps):

1. Basic info (name, role, location, rate range)
2. Skills + tech stack (tag selector)
3. Assessment checklist (toggle completed items)
4. Profile text (bio, highlights)

#### B.3.6 /admin/clients — Clients

**Table**: Company · Contact · Stage · Active placements · Total spend · Since · Actions

**Client detail drawer**: Company info, all briefs, all placements, billing history, internal notes.

#### B.3.7 /admin/placements — Active Placements

**Table**: Engineer · Client · Role · Start date · Duration · Type · Status · Monthly value · Actions

**Status options**: Active / Paused / Ending soon (< 30 days) / Completed

**Placement detail drawer**: Full placement record, satisfaction ratings, extension history, communications log.

#### B.3.8 /admin/revenue — Revenue

**Layout**: Date range picker + 3 KPI cards + 2 charts

**KPI cards** (JetBrains Mono values):

- Monthly Recurring Revenue (MRR)
- Total placements revenue (all time)
- Average engagement value

**Chart 1**: MRR trend (line chart, last 12 months, `Recharts`)
**Chart 2**: Revenue by engagement type (stacked bar, project vs embedded vs team extension)

**Table below**: Monthly breakdown by client — rows sortable by column.

#### B.3.9 /admin/content — Content Management

**Sections**: Blog posts · Case studies · Engineers.md sync

**Blog tab**: Table of posts (title, category, status: Draft/Published, date, author) + "New post" button → opens MDX editor

**Case studies tab**: Same pattern as blog but for `/work/[slug]`

**No custom CMS needed**: Admin edits MDX files via this UI, which writes to `src/content/blog/` and `src/content/work/` on the server side.

#### B.3.10 /admin/settings — Platform Settings

Sections:

- Notification preferences (which events trigger alerts)
- Matching parameters (default response SLA, match limits per brief)
- Integration keys (Crisp, GA4, Resend email)
- User management (add/remove admin users)

---

### B.4 Client Dashboard (`/dashboard`)

The hiring company workspace. Scoped to the authenticated client organisation.

#### B.4.1 Onboarding Flow (First Login)

**Aha moment definition**: Client views at least one engineer profile in their matches shortlist.

**First-login flow** (skip after completion, state in user record):

```
Step 1 — Welcome modal (full-screen overlay, dismissable)
  "Welcome to your Andishi workspace."
  "Your brief is being reviewed. Here's what happens next."
  [3-step visual: Brief → Profiles → Intro]
  [Continue →]

Step 2 — Brief confirmation screen
  Shows the brief they submitted.
  [Edit brief] [Looks good →]

Step 3 — Notification preferences
  "How would you like to be notified when profiles arrive?"
  Toggle: Email · In-app · Both (default: Both)
  [Save preferences →]

Dashboard loads.
```

**Onboarding checklist** (dismissable card, top of overview until 100% complete):

```
[●] Brief submitted
[●] Workspace set up
[○] Review first profiles  ← first activation event
[○] Schedule intro call
[○] Onboard first developer
```

Progress bar. On 100%: confetti + "Time to ship 🚀" toast + checklist collapses to a small badge.

#### B.4.2 Navigation

```
/dashboard             Overview
/dashboard/brief       My Brief
/dashboard/matches     Developer Profiles  ← most important
/dashboard/team        My Team (active placements)
/dashboard/projects    Projects
/dashboard/messages    Messages
/dashboard/payments    Payments
/dashboard/settings    Settings
```

Sidebar groups:

- **Hiring**: Overview · My Brief · Developer Profiles
- **Active**: My Team · Projects · Messages
- **Admin**: Payments · Settings

#### B.4.3 /dashboard — Overview

**Onboarding checklist** (if incomplete, see above)

**Top row** (3 KPI cards):

```
Developers Active  |  Open Brief Status        |  Next Milestone
[N]                |  "Profiles incoming"       |  [date + description]
                   |  (or "3 profiles ready")   |
```

**Profile preview strip** (horizontal scroll, max 3 cards):
Shows top 3 matched engineer teasers from `/dashboard/matches` with "View all profiles →" link. If no matches yet: empty state with estimated arrival.

**Empty state copy** (before any profiles):

```
[Hourglass icon — Tabler, 28px, stroke 1.5]
"Our team is reviewing your brief."
"Expect your first developer profiles within 8 days."
[Edit your brief →]
```

**Recent activity** (below profiles): timestamped events relevant to this client.

#### B.4.4 /dashboard/brief — My Brief

Displays the submitted brief in a clean read-only layout with an "Edit brief" option.

**Sections**: Role details · Tech requirements · Timeline · Engagement model · Budget range · Additional notes

If edited, show "Brief updated — our team will review changes within 24 hours" toast.

#### B.4.5 /dashboard/matches — Developer Profiles (Most important page)

**Layout**: Filter chips (All / Available Now / [Role filter]) + profile cards

Each profile card (glassmorphic, same design as public `/engineers` but with client-specific actions):

```
Avatar + Name + Role + Seniority badge (JetBrains Mono)
Skills tags + Timezone + Availability
[Vetting badges: ✓ System Design · ✓ Code Review · ✓ Architecture]
Andishi match score (internal, displayed as "Strong match" / "Good match")
[View full profile →]  [Request Intro →] (amber CTA)
```

**Intro request flow** (inline, no page change):

1. Click "Request Intro →"
2. Inline expansion: "Preferred times for a 30-minute call" (date/time picker, 3 slots)
3. Optional message
4. [Send request →]
5. Confirmation: "Intro request sent. You'll hear back within 24 hours."
6. Card status badge updates to "Intro Requested"

#### B.4.6 /dashboard/team — My Team

Only active after first placement.

**Team member cards** (larger than match cards, shows engagement context):

- Photo + name + role
- Engagement type chip
- Engagement start date + duration
- Project association
- Last active (from time tracking)
- [Message] [View project] [Manage engagement]

**Empty state**: "Your team will appear here once your first developer is onboarded." + [Browse profiles →]

#### B.4.7 /dashboard/projects — Projects

Simplified project view showing deliverables and milestone progress.

**Project card**:

- Name + client-defined description
- Associated developer(s)
- Progress bar (milestone-based)
- Status chip
- Next milestone + due date

**Project detail** (drawer):

- Milestone checklist (admin can mark, client sees)
- File/deliverable links
- Notes thread

#### B.4.8 /dashboard/messages — Messages

**Layout**: Conversation list (left) + message thread (right) / full-screen on mobile

Each conversation: engineer avatar + name + last message preview + timestamp + unread count

Message thread: standard chat layout (bubbles, timestamps, read receipts)

**Note**: This uses Crisp for actual real-time messaging. This view is a wrapper around the Crisp inbox API or a direct integration. Do not build a custom WebSocket chat.

#### B.4.9 /dashboard/payments — Payments

**Table**: Invoice date · Description · Engineer · Amount · Status · Download

Status chips: Paid / Pending / Overdue

**Above table**: Running total of spend (JetBrains Mono, large) + next invoice date

**Note**: Payments integration (Stripe or manual) is out of scope for v3. Show placeholder with "Payment setup coming soon" until integration is ready. Do not block the route — show the empty state with the placeholder.

---

### B.5 Developer Dashboard (`/dev`)

The engineer workspace. Scoped to the authenticated developer.

#### B.5.1 Onboarding Flow (First Login)

**Aha moment definition**: Developer completes their profile and is marked "Ready for placement" by admin.

**First-login flow**:

```
Step 1 — Welcome modal
  "Welcome to the Andishi network."
  "Complete your profile to be considered for your first placement."
  [Let's go →]

Step 2 — Profile wizard (3 steps)
  Step 2a: Photo + bio (2–3 sentences)
  Step 2b: Skills + stack (tag selector, min 3)
  Step 2c: Availability + rate expectation (chips + range input)
  [Complete profile →]

Step 3 — Vetting status screen
  "Your profile is under review."
  "Our team will complete your technical assessment within 5 business days."
  "You'll be notified when you're cleared for placement."
  [Go to dashboard →]
```

**Onboarding checklist** (same pattern as client):

```
[●] Account created
[●] Profile completed
[○] Technical assessment passed
[○] First placement matched
[○] First payment received
```

#### B.5.2 Navigation

```
/dev              Overview
/dev/profile      My Profile
/dev/projects     My Projects
/dev/time         Time Tracking
/dev/earnings     Earnings
/dev/messages     Messages
/dev/settings     Settings
```

Sidebar groups:

- **Work**: Overview · My Projects · Time Tracking
- **Career**: My Profile · Earnings
- **Admin**: Messages · Settings

#### B.5.3 /dev — Overview

**Top row** (3 KPI cards, JetBrains Mono values):

```
Hours This Week  |  This Month Earned  |  Active Projects
[N hrs]          |  $[X]               |  [N]
vs last week     |  vs last month      |
```

**Earnings card** (featured, blue gradient as per DashboardDualSection component):

- Monthly total in large JetBrains Mono
- Trend vs last month
- Sparkline (last 6 months)

**Time tracker** (inline, same as DashboardDualSection component):

- Active timer display
- Current project association
- Start/stop button
- Weekly bar chart

**Task checklist** (current sprint tasks):

- Pulled from active project
- Checkable inline
- Tags: done / today / overdue

#### B.5.4 /dev/profile — My Profile

Editable version of the public `/engineers/[slug]` profile.

**Sections**:

- Photo upload (handled by existing avatar component)
- Headline + bio (rich text)
- Work history (add/edit/remove timeline items)
- Skills (tag selector — searchable, add custom)
- Portfolio links (GitHub, live URLs)
- Availability toggle + next available date (if not "now")

**Vetting badges section** (read-only, set by admin):

- Shows current assessment status
- Completed items have ✓ icon
- Pending items show "Pending" chip

**Profile visibility toggle**: "Show my profile to new clients" (on/off). Off = excluded from match results.

#### B.5.5 /dev/projects — My Projects

Same card layout as client projects but from the engineer's perspective.

**Project card** (developer view):

- Project name + client (anonymised until placement confirmed)
- Role in project
- Timeline + weekly hours committed
- Milestone progress
- [Open project] [Log time]

**Empty state**: "No active projects yet. You'll be notified when you're matched to a client." + [Complete profile →]

#### B.5.6 /dev/time — Time Tracking

**Layout**: Active timer (top, sticky) + week view + month log

**Active timer card** (expanded DashboardDualSection time tracker):

- Project selector (dropdown of active projects)
- Description input (optional, max 100 chars)
- Running timer (JetBrains Mono, animated)
- Start / Stop / Save buttons

**Week view** (7-column calendar, Mon–Sun):

- Each day column shows hours logged per project (colour-coded by project)
- Click a block → edit log entry (time, description, project)

**Month log table** (below week view):
Date · Project · Description · Duration · Billable (yes/no)

**Weekly total** (JetBrains Mono, bold treatment, right-aligned above table): `[N] hours this week`

#### B.5.7 /dev/earnings — Earnings

**Layout**: 3 KPI cards + 2 charts + payment table

**KPI cards**:

- This month (JetBrains Mono, large, blue)
- Last month
- Total all time

**Chart 1**: Monthly earnings bar chart (12 months, `Recharts`)
**Chart 2**: Earnings by project (donut chart, top 5 projects)

**Payment table**:
Invoice date · Project · Client · Hours · Rate · Total · Status · Download

Status: Paid (green) / Pending (amber) / Processing (blue)

**Note**: Payments integration placeholder same as client. Table shows data when API available.

---

### B.6 Shared Dashboard Components

Build these as reusable components in `src/components/dashboard/`. All use v3 design tokens (blue primary, no purple, font-normal/font-medium only, JetBrains Mono for numerics).

| Component             | File                      | Notes                                                                              |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `InsightsCard`        | `InsightsCard.tsx`        | KPI card: label + JetBrains Mono value + trend + sparkline + icon. Glassmorphic.   |
| `OnboardingChecklist` | `OnboardingChecklist.tsx` | Dismissable card, progress bar, confetti on 100%.                                  |
| `WelcomeModal`        | `WelcomeModal.tsx`        | Full-screen overlay, framer-motion fade. Role-aware content.                       |
| `EmptyState`          | `EmptyState.tsx`          | Tabler icon + heading + body + optional CTA.                                       |
| `ActivityFeed`        | `ActivityFeed.tsx`        | Timestamped event list, role-scoped events.                                        |
| `ProfileCard`         | `ProfileCard.tsx`         | Engineer card — public and admin/client/dev variants via `variant` prop.           |
| `ProjectCard`         | `ProjectCard.tsx`         | Project card with progress bar and milestone chips.                                |
| `KanbanBoard`         | `KanbanBoard.tsx`         | Drag-and-drop (dnd-kit) Kanban. Admin-only.                                        |
| `DataTable`           | `DataTable.tsx`           | Sortable/filterable table — TanStack Table. All admin tables.                      |
| `FilterBar`           | `FilterBar.tsx`           | Chip-style filter row + search input. Reused across directories.                   |
| `DrawerPanel`         | `DrawerPanel.tsx`         | Slide-in right panel. Used for brief detail, engineer detail, placement detail.    |
| `TimeTracker`         | `TimeTracker.tsx`         | Active timer + project selector + bar chart. Developer-only.                       |
| `EarningsCard`        | `EarningsCard.tsx`        | Blue gradient card with JetBrains Mono earnings value + sparkline. Developer-only. |
| `Sparkline`           | `Sparkline.tsx`           | Pure SVG 100×40 sparkline, colour-configurable.                                    |
| `StatusBadge`         | `StatusBadge.tsx`         | Chip: Active / Pending / Available / etc. Semantic colour per status.              |
| `VettingBadges`       | `VettingBadges.tsx`       | 4 assessment badges with ✓ icon. Used in engineer profiles.                        |
| `DashboardTopNav`     | `DashboardTopNav.tsx`     | Breadcrumb + notifications + avatar dropdown + theme toggle.                       |
| `RoleSidebar`         | `RoleSidebar.tsx`         | Collapsible sidebar, role-aware nav items, single-open accordion.                  |

---

### B.7 Onboarding — Activation Metrics Plan

**Client activation funnel**:

```
Login → See overview → View matches tab → Open first profile → Request intro
100%     85%              60%               45%                 20%
                                            ← Target aha moment
```

**Developer activation funnel**:

```
Login → Start profile wizard → Complete profile → Assessment passed → First placement
100%     90%                     55%               40%                 25%
                                                   ← Target aha moment
```

**Events to track** (add to existing GA4/dataLayer plan):

```javascript
// Client
{ event: 'client_onboarding_step', step: 1..3 }
{ event: 'profile_viewed', engineer_slug, source: 'dashboard' }
{ event: 'intro_requested', engineer_slug }
{ event: 'client_activated' }  // on first intro request

// Developer
{ event: 'dev_onboarding_step', step: 1..3 }
{ event: 'profile_completed' }
{ event: 'dev_activated' }  // on first placement match

// Both
{ event: 'checklist_item_completed', item_name }
{ event: 'checklist_completed' }
```

---

### B.8 Empty States — Copy Bank

Every empty state must explain what the area is for, show what it looks like with data (or describe it), and offer a clear primary action.

| Location                | Icon           | Heading                      | Body                                                                                                   | CTA              |
| ----------------------- | -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------- |
| Client: no matches yet  | `IconClock`    | "Profiles on the way."       | "Our team is reviewing your brief. First developer profiles arrive within 8 days."                     | Edit brief       |
| Client: no team yet     | `IconUsers`    | "Your team starts here."     | "Once your first developer is onboarded, they'll appear here with project and comms context."          | Browse profiles  |
| Client: no projects     | `IconRocket`   | "Projects appear here."      | "Create a project once your first developer is onboarded to track milestones and deliverables."        | —                |
| Developer: no projects  | `IconCode`     | "No active projects yet."    | "You'll be notified here when you're matched to a client. Complete your profile to speed up matching." | Complete profile |
| Developer: no time logs | `IconClock`    | "Start tracking your time."  | "Log hours against active projects here. Accurate time tracking feeds directly into your earnings."    | Start timer      |
| Developer: no earnings  | `IconCoin`     | "Your earnings appear here." | "Your first invoice will be generated once your first project milestone is approved."                  | —                |
| Admin: no briefs        | `IconFileText` | "No briefs yet."             | "Hiring briefs submitted through the public site will appear here for review and matching."            | —                |

---

## PART C: EXECUTION ORDER

Run in this exact sequence:

### Phase 1 — Public pages (1 week)

1. `/hire` — hero, process timeline, guarantees, engagement models, FAQ teaser, CTA. Schema: HowTo + FAQ + Breadcrumb.
2. `/hire/faq` — 12 Q&As, accordion, sticky ToC. Schema: FAQPage full.
3. `/engineers` — static data file, card grid, filter bar. Schema: ItemList + BreadcrumbList.
4. `/engineers/[slug]` — profile template, vetting badges, related engineers.
5. `/skills/fullstack` and `/skills/ai` — template + domain data files.
6. `/skills/web3` and `/skills/aws` — same template.
7. `/studio` — 4 sections, links from /services.
8. `/blog` index + `/blog/[slug]` template + `/blog/category/[slug]`.
9. `public/engineers.md` + `public/pricing.md`.
10. All JSON-LD per the schema map table.

### Phase 2 — Dashboard shell (3–4 days)

1. `SidebarProvider` context + `RoleSidebar` component.
2. `AppShell` layout + `DashboardTopNav`.
3. Auth role-check in `(app)/layout.tsx` → redirect logic.
4. All shared components (InsightsCard, EmptyState, StatusBadge, etc.).

### Phase 3 — Client dashboard (3–4 days)

1. `/dashboard` overview with KPI cards, profile strip, empty states, onboarding checklist.
2. `WelcomeModal` first-login flow.
3. `/dashboard/brief` — read + edit.
4. `/dashboard/matches` — profile cards + intro request flow.
5. `/dashboard/team`, `/dashboard/projects`, `/dashboard/messages`, `/dashboard/payments`.

### Phase 4 — Developer dashboard (3–4 days)

1. `/dev` overview with earnings card + time tracker + task list.
2. Profile wizard first-login flow.
3. `/dev/profile` — editable profile.
4. `/dev/projects`, `/dev/time`, `/dev/earnings`, `/dev/messages`.

### Phase 5 — Super Admin dashboard (4–5 days)

1. `/admin` overview with pipeline board + activity feed.
2. `/admin/briefs` — table + brief detail drawer.
3. `/admin/matches` — full Kanban.
4. `/admin/engineers` — directory + add engineer modal.
5. `/admin/clients`, `/admin/placements`.
6. `/admin/revenue` — charts.
7. `/admin/content` — blog/case study table.
8. `/admin/settings`.

### Phase 6 — Polish + QA

1. `npx tsc --noEmit` — resolve all type errors.
2. `npm run lint` — resolve warnings.
3. Replace all `<img>` with `next/image`.
4. Delete legacy files: `docs/andishi-landing-page-content.md`, `docs/andishi-landing-page-content.pdf`, `hero maybe.png`.
5. Remove unused `Comparison` function from `src/app/page.tsx`.
6. Visual QA pass at 375px, 768px, 1280px, and 1440px — both light and dark mode.
7. Lighthouse run: LCP < 2.5s, CLS < 0.1, INP < 100ms.

---

## PART D: KNOWN DECISIONS

| Decision                       | Rationale                                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/start-project` route kept    | Legacy name, copy is already talent-first. Add `/hire` as the canonical process page and CTA destination. Redirect `/start-project` to `/hire` in a future pass once `/hire` is indexed. |
| Static JSON for engineer data  | Fastest path to launch. Migrate to DB-backed API in a future sprint when admin CRUD is live.                                                                                             |
| MDX for blog + case studies    | No CMS overhead. Admin content tab handles file writes server-side. Migrate to headless CMS when content volume justifies it.                                                            |
| Crisp for messaging            | Do not build custom WebSocket chat. The `/messages` tab in both client and dev dashboards wraps Crisp inbox.                                                                             |
| Payments placeholder           | Stripe integration is a separate sprint. Show table structure with empty state.                                                                                                          |
| dnd-kit for Kanban             | Lightweight, no legacy API, works with React 19. Admin-only.                                                                                                                             |
| TanStack Table for data tables | Already likely in the stack or trivial to add. All admin tables use this.                                                                                                                |
| No date in blog URLs           | `/blog/[slug]` not `/blog/2026/[slug]`. AI systems and backlinks do not benefit from date-stamped URLs.                                                                                  |

---

_End of spec. Execute Phase 1 through Phase 6 in order. Every route, schema, component, and copy decision in this document supersedes any defaults or previous patterns._
