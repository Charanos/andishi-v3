# Andishi v2 → v3: Current State Audit

> This document captures the complete state of the existing Andishi MVP codebase.
> Every route, component, API endpoint, data schema, and design pattern is catalogued here
> to ensure nothing is lost during the v3 UI/UX revamp.

---

## 1. Technology Stack (Current)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.3.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 + tw-animate-css | ^4.1.8 |
| Animation | Framer Motion | ^12.16.0 |
| Database | MongoDB (via Prisma + native driver) | — |
| ORM | Prisma Client | ^6.10.1 |
| Auth | Custom JWT (jose) + next-auth | ^6.0.11 / ^4.24.11 |
| Forms | React Hook Form + Zod | ^7.58.0 / ^3.25.64 |
| Charts | Chart.js + Recharts | ^4.5.0 / ^3.0.2 |
| Icons | react-icons (FA, SI) + lucide-react | ^5.5.0 / ^0.514.0 |
| UI Primitives | Radix UI (Dialog, Select, Label, etc.) | Various |
| Maps | Leaflet | ^1.9.4 |
| Smooth Scroll | Lenis | ^1.3.4 |
| Fonts | Nunito (body) + Montserrat (headings) | Google Fonts |
| Analytics | Vercel Analytics + Google Analytics + Facebook Pixel | — |

---

## 2. Route Map (All Existing Routes)

### 2.1 Public / Marketing Routes

| Route | File | Purpose | Size |
|---|---|---|---|
| `/` | `app/page.tsx` | Homepage (11 sections) | 3.7KB |
| `/about-us` | `app/about-us/page.tsx` | About + Team | 30KB |
| `/about-us` (team) | `app/about-us/our-team.tsx` | Team section component | 20KB |
| `/contact-us` | `app/contact-us/` | Contact form + map | — |
| `/our-portfolio` | `app/our-portfolio/` | Projects showcase | — |
| `/tech-talent-pool` | `app/tech-talent-pool/page.tsx` | Developer profiles browser | 62KB |
| `/start-project` | `app/start-project/page.tsx` | Client hiring brief form | 54KB |
| `/join-talent-pool` | `app/join-talent-pool/` | Developer application form | — |
| `/featured-blog` | `app/featured-blog/` | Blog listing | — |
| `/blogs` | `app/blogs/` | Blog section (also used as homepage section) | — |
| `/thank-you-start-project` | `app/thank-you-start-project/` | Post-submit confirmation (client) | — |
| `/thank-you-join-talent-pool` | `app/thank-you-join-talent-pool/` | Post-submit confirmation (dev) | — |
| `/thanks` | `app/thanks/` | Generic thank you | — |

### 2.2 Auth Routes

| Route | File | Purpose |
|---|---|---|
| `/login` | `app/login/page.tsx` | Login (email/password) — 754 lines, split layout with orbiting tech icons |
| `/unauthorized` | `app/unauthorized/` | Access denied page |

### 2.3 Dashboard Routes (Protected)

| Route | File | Role | Size |
|---|---|---|---|
| `/admin-dashboard` | `app/admin-dashboard/page.tsx` | ADMIN | 117KB (3143 lines) |
| `/client-dashboard` | `app/client-dashboard/page.tsx` | CLIENT | 78KB (2014 lines) |
| `/developer-dashboard` | `app/developer-dashboard/page.tsx` | DEVELOPER | 17KB (455 lines) |

### 2.4 API Routes

| Endpoint | Directory | Methods |
|---|---|---|
| `/api/auth/*` | `app/api/auth/` | Login, verify |
| `/api/users` | `app/api/users/` | GET (list), user management |
| `/api/projects` | `app/api/projects/` | CRUD |
| `/api/client-projects` | `app/api/client-projects/` | Client-scoped project CRUD |
| `/api/start-project` | `app/api/start-project/` | Public project submission |
| `/api/join-talent-pool` | `app/api/join-talent-pool/` | Public developer application |
| `/api/developer-profiles` | `app/api/developer-profiles/` | Public dev profile listing |
| `/api/developer-profile` | `app/api/developer-profile/` | Authenticated dev profile (single) |
| `/api/project-assignments` | `app/api/project-assignments/` | Assignment management |
| `/api/project-chat` | `app/api/project-chat/` | Chat messages per project |

---

## 3. Database Schema (Prisma — MongoDB)

### Models (DO NOT MODIFY)

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id, email, firstName, lastName, role, status, isActive, isOnline, lastSeen, accountCreated, passwordGenerated, projectCount, progress | → DeveloperProfile, ChatMessage, ChatParticipant, ProjectAdminAssignment |
| **DeveloperProfile** | id, data (JSON), userId | → User, ProjectAssignment |
| **Project** | id, title, description, status, priority, budget, timeline, techStack[], requiredSkills[], experienceLevel, maxTeamSize, clientId | → ProjectAssignment, ChatParticipant, ChatMessage, ProjectAdminAssignment |
| **ProjectAssignment** | id, projectId, developerId, role, status | → Project, DeveloperProfile |
| **ChatParticipant** | id, projectId, userId, role, joinedAt, isMuted, lastRead | → Project, User |
| **ChatMessage** | id, projectId, senderId, content, messageType, isRead, isDeleted, timestamp | → Project, User |
| **ProjectAdminAssignment** | id, projectId, adminId, assignedBy, assignedAt | → Project, User (x2) |

### TypeScript Types (types/index.ts)

- `UserInfo`, `ProjectDetails`, `ProjectStatus`, `Milestone`, `PricingOption`
- `ProjectUpdate`, `ProjectFile`, `Payment`, `ProjectData`
- `BaseProjectWithDetails`, `ProjectWithDetails`
- `UserRole` (types/auth.ts): `ADMIN`, `CLIENT`, `DEVELOPER`

---

## 4. Component Inventory

### 4.1 Layout Components

| Component | File | Purpose |
|---|---|---|
| `Navbar` | `app/layout/Navbar.tsx` | Main navigation — glassmorphic, sticky, auth-aware |
| `Footer` | `app/layout/Footer.tsx` | 5-column footer with socials |
| `ConditionalLayout` | `app/components/ConditionalLayout.tsx` | Route-based layout switching (navbar/footer visibility, auth gating) |
| `PageTransition` | `app/components/PageTransition.tsx` | Framer Motion page transitions |
| `ClientMotionProvider` | `app/components/ClientMotionProvider.tsx` | Motion provider wrapper |

### 4.2 Homepage Sections

| Section | File | Order | Notes |
|---|---|---|---|
| HeroSection | `app/sections/HeroSection.tsx` | 1 | Split layout, gradient bg, trust indicators |
| MiniStats | `app/sections/MiniStats.tsx` | 2 | Key metrics strip |
| WhyAndishi | `app/sections/WhyAndishi.tsx` | 3 | 6 stats cards + InteractiveTalentVisualization |
| HowWeDoIt | `app/sections/HowWeDoIt.tsx` | 4 | 4-step process |
| DevDashboardDisplay | `app/sections/DevDashboardDisplay.tsx` | 5 | Dev dashboard preview |
| Services | `app/sections/Services.tsx` | 6 | 4 service cards (expandable mosaic) |
| ClientDashboardDisplay | `app/sections/ClientDashboardDisplay.tsx` | 7 | Client dashboard preview |
| ProjectsShowcase | `app/sections/ProjectsShowcase.tsx` | 8 | Featured projects |
| ClientReviews | `app/sections/ClientReviews.tsx` | 9 | Testimonials |
| LatestInsights | `app/sections/LatestInsights.tsx` | 10 | Blog articles |
| Newsletter | `app/sections/Newsletter.tsx` | 11 | Email subscribe |

### 4.3 Shared UI Components

| Component | File | Notes |
|---|---|---|
| `CTAButton` | `app/components/CTAButton.tsx` | Basic CTA |
| `Card` | `app/components/Card.tsx` | Generic card |
| `LoadingSpinner` | `app/components/LoadingSpinner.tsx` | Loader |
| `ScrollToTop` | `app/components/ScrollToTop.tsx` | Scroll utility |
| `FloatingWhatsappButton` | `app/components/FloatingWhatsappButton.tsx` | WhatsApp FAB |
| `InteractiveMap` | `app/components/InteractiveMap.tsx` | Leaflet map |
| `InteractiveTalentVisualization` | `app/components/InteractiveTalentVisualization.tsx` | Animated talent viz |
| `DevProfileModal` | `app/components/DevProfileModal.tsx` | Developer profile detail modal |
| `ProtectedRoutes` | `app/components/ProtectedRoutes.tsx` | Route guard |
| `SmoothScrollProvider` | `app/components/SmoothScrollProvider.tsx` | Lenis wrapper |

### 4.4 Admin Dashboard Components

| Component | File | Size |
|---|---|---|
| `DeveloperProfilesOverview` | `admin-dashboard/DeveloperProfilesOverview.tsx` | 76KB |
| `DeveloperProfileEditor` | `admin-dashboard/DeveloperProfileEditor.tsx` | 39KB |
| `AddNewDeveloper` | `admin-dashboard/AddNewDeveloper.tsx` | 38KB |
| `ProjectOverview` | `admin-dashboard/ProjectOverview.tsx` | 145KB |
| `ProjectAssignments` | `admin-dashboard/ProjectAssignments.tsx` | 34KB |
| `ProjectAssignmentManager` | `admin-dashboard/ProjectAssignmentManager.tsx` | 46KB |
| `ProjectChat` | `admin-dashboard/ProjectChat.tsx` | 17KB |
| `StartNewProject` | `admin-dashboard/StartNewProject.tsx` | 54KB |
| `renderAnalytics` | `admin-dashboard/renderAnalytics.tsx` | 28KB |
| `renderUsers` | `admin-dashboard/renderUsers.tsx` | 90KB |

### 4.5 Client Dashboard Components

| Component | File | Size |
|---|---|---|
| `SearchFilter` | `client-dashboard/SearchFilter.tsx` | 18KB |
| `StartNewProject` | `client-dashboard/StartNewProject.tsx` | 48KB |
| `projectDetails` | `client-dashboard/projectDetails.tsx` | 87KB |

### 4.6 Developer Dashboard Components

| Component | File | Size |
|---|---|---|
| `DevOverview` | `developer-dashboard/DevOverview.tsx` | 22KB |
| `DevProjects` | `developer-dashboard/DevProjects.tsx` | 30KB |
| `DevSkills` | `developer-dashboard/devSkills.tsx` | 23KB |
| `DevAnalytics` | `developer-dashboard/DevAnalytics.tsx` | 28KB |
| `DevAchievements` | `developer-dashboard/DevAchievements.tsx` | 16KB |
| `EditProfileModal` | `developer-dashboard/EditProfileModal.tsx` | 9KB |
| `ProjectDetail` | `developer-dashboard/ProjectDetail.tsx` | 6KB |

---

## 5. Design System Audit (Current Issues)

### 5.1 Colors — Inconsistencies

- **Purple used extensively**: `purple-400`, `purple-500`, `purple-900/50`, `bg-purple-500/20` — appears in hero, CTAs, gradients, accents across ALL pages
- **Primary brand color**: `#00C6FB` (cyan) defined in tailwind.config but rarely used consistently
- **Hardcoded colors**: Many inline hex values (`#0B0D0E`, `#05122273`, `#96aeff`, `#c156ff`)
- **No design tokens**: Colors defined ad-hoc in each component, no centralized system

### 5.2 Typography — Violations

- **`font-bold`** used in: Hero (`font-semibold`), Footer, Login page, Dashboard headings
- **`font-semibold`** used extensively across ALL components
- **Nunito + Montserrat** — v3 spec requires **Outfit + JetBrains Mono**
- **No mono font** for numerics — stats, prices, IDs all use body font
- **`.monty` class** — custom class for Montserrat, used in many places

### 5.3 Icons — Mixed Libraries

- **react-icons/fa** (Font Awesome) — primary icon library across all components
- **react-icons/si** (Simple Icons) — used for tech brand icons
- **lucide-react** — used in client dashboard
- **Inline SVGs** — used in hero CTAs, navbar hamburger
- v3 spec requires: **@tabler/icons-react only**

### 5.4 Animation

- Framer Motion used but with `ease: "easeOut"` — v3 requires springs (`damping: 25, stiffness: 200`)
- CSS `animate-pulse` used extensively for ambient effects

### 5.5 Layout

- No route groups — all pages at `app/` root level
- Dashboard pages are monolithic single files (admin: 3143 lines, client: 2014 lines)
- No `loading.tsx` or `error.tsx` boundary files
- Background: SVG overlay pattern applied globally via `bg-gradient-overlay.svg`

---

## 6. Auth System (Preserve Entirely)

- **Custom JWT auth** via `jose` library
- Token stored in `auth_token` cookie (httpOnly) + localStorage
- Middleware at `middleware.ts` — verifies JWT, adds user headers
- `useAuth` hook at `hooks/useAuth.ts` — provides user, login, logout, redirectToDashboard
- Role-based routing: ADMIN → `/admin-dashboard`, CLIENT → `/client-dashboard`, DEVELOPER → `/developer-dashboard`
- RBAC utility at `utils/rbac.ts`
- **Login rate limiting** — 5 attempts, 15-minute lockout (client-side localStorage)

---

## 7. Third-Party Integrations (Preserve)

| Integration | Implementation |
|---|---|
| Google Analytics | GA4 tag `G-8668KBDWFZ` via `next/script` |
| Google Ads | Conversion tag `AW-16686798799` |
| Facebook Pixel | Pixel ID `721165943984672` |
| Vercel Analytics | `@vercel/analytics/next` |
| Vercel Speed Insights | `@vercel/speed-insights/next` |
| WhatsApp | Floating button component linking to WhatsApp |

---

## 8. Key Patterns to Preserve

1. **ConditionalLayout** pattern — route-based navbar/footer visibility
2. **Auth flow** — JWT cookie + localStorage, middleware verification
3. **Project data flow** — `services/clientProjects.ts` service layer → API routes → Prisma/MongoDB
4. **Role-based dashboard access** — admin can access all, others restricted
5. **Form validation** — React Hook Form + Zod schemas in `lib/formSchema.ts`
6. **Project CRUD hooks** — `useProjectCRUD`, `useProjectChat`, `useProjectOperation`
7. **Developer profile modal** — full profile view modal used in talent pool + admin
