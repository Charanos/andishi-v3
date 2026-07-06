/**
 * scripts/seed-dev.ts
 *
 * Seeds the DEV Neon database from existing src/data/*.ts mock data.
 * Run with: npm run db:seed
 *
 * What this seeds:
 *   - testimonials        → testimonials table
 *   - blog posts          → blog_posts table
 *   - job openings        → job_openings table
 *   - case study projects → projects table (with isPublic=true + mapped fields)
 *
 * Safe to re-run — uses onConflictDoNothing() so existing rows are never overwritten.
 */

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "../src/db/schema";

neonConfig.webSocketConstructor = ws;

// ─────────────────────────────────────────────────────────────
// Inline seed data (mirrors src/data/*.ts without importing Next.js)
// ─────────────────────────────────────────────────────────────

const DEFAULT_TESTIMONIALS = [
  {
    authorName: "Amina Otieno",
    authorRole: "CTO, Haraka Fleet",
    content:
      "Andishi delivered our custom fleet routing platform in under 6 weeks. The code is modular, type-safe, and performs flawlessly under high operational loads. We bypassed the standard recruiter overhead entirely.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/fleet-management-engine",
    rating: 5,
    date: "2026-05-12",
    status: "active" as const,
    featured: true,
    order: 1,
  },
  {
    authorName: "Kwame Mensah",
    authorRole: "Founder, Lipa Commerce",
    content:
      "The custom payment ledger Andishi built for us was exactly what we needed to move off manual spreadsheets. Direct communications with their product engineers saved us weeks of scoping cycles.",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/payment-reconciliation-engine",
    rating: 5,
    date: "2026-06-04",
    status: "active" as const,
    featured: true,
    order: 2,
  },
  {
    authorName: "Zainab Bello",
    authorRole: "Director of Product, MySchool Platform",
    content:
      "Their expertise in database scaling was obvious from day one. They re-architected our core student database and speeded up page loading times by over 200%. Highly recommended for complex backend systems.",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/school-operations-platform",
    rating: 5,
    date: "2026-04-18",
    status: "active" as const,
    featured: false,
    order: 3,
  },
  {
    authorName: "Ethan Novak",
    authorRole: "Co-Founder, Orbit Labs",
    content:
      "We hired Andishi to build our AI document search pipeline. The integration is seamless and cost-controlled. Their engineering capability is on par with top-tier global agencies.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/ai-customer-support-agent",
    rating: 5,
    date: "2026-05-30",
    status: "active" as const,
    featured: false,
    order: 4,
  },
];

const DEFAULT_BLOG_POSTS = [
  {
    slug: "how-to-brief-a-senior-engineer",
    title: "How to brief a senior engineer so matching works faster",
    category: "Hiring" as const,
    excerpt:
      "The strongest hiring briefs describe ownership, context, stack, and risk. Here is the structure Andishi uses before shortlisting engineers.",
    coverImage: "/images/featured-blog.jpg",
    authorName: "Ian Mwangi",
    authorRole: "Founder, Andishi",
    authorAvatarUrl: "/images/ian.jpg",
    datePublished: "2026-05-08",
    dateModified: "2026-05-08",
    readTime: 5,
    featured: true,
    body: [
      "A strong engineering brief does not start with a list of frameworks. It starts with the problem the engineer must own and the decision they should help your team make faster.",
      "At Andishi, the most useful briefs cover the current product state, the team shape, the bottleneck, the production stack, timeline pressure, timezone needs, and the engagement model. That gives the matching team enough signal to shortlist for ownership instead of keywords.",
      "If you only know the outcome, say that plainly. A senior engineer can help shape the route, but they still need to understand the business constraint, users affected, and what success looks like after the first sprint.",
    ],
    status: "published" as const,
  },
  {
    slug: "why-africa-is-a-strong-timezone-for-startups",
    title: "Why African engineering time zones work for global startups",
    category: "Remote Work" as const,
    excerpt:
      "UTC+0 to UTC+3 gives meaningful overlap with Europe and useful daily touchpoints for US East teams.",
    coverImage: "/images/blog-image-2.jpg",
    authorName: "Andishi Team",
    authorRole: "Talent Operations",
    authorAvatarUrl: "/logo.svg",
    datePublished: "2026-05-06",
    dateModified: "2026-05-08",
    readTime: 4,
    featured: false,
    body: [
      "Remote hiring is not just about talent quality. It is also about overlap, handoff, and how much coordination tax the team pays every week.",
      "African engineering time zones commonly sit between UTC+0 and UTC+3. That creates clean overlap with European teams and a useful morning overlap with US East Coast teams.",
      "The advantage becomes clearer when the engineer is senior. Fewer meetings are needed because ownership is higher, but the team still has enough overlap to build trust and unblock decisions quickly.",
    ],
    status: "published" as const,
  },
  {
    slug: "production-ai-needs-product-engineers",
    title: "Production AI needs product engineers, not just model fluency",
    category: "Engineering" as const,
    excerpt:
      "RAG quality, latency, cost, evaluation, and UX integration are product engineering problems as much as AI problems.",
    coverImage: "/images/blog-image-5.jpg",
    authorName: "Andishi Team",
    authorRole: "Engineering Notes",
    authorAvatarUrl: "/logo.svg",
    datePublished: "2026-05-04",
    dateModified: "2026-05-08",
    readTime: 6,
    featured: false,
    body: [
      "The distance between an AI demo and a reliable product feature is larger than most teams expect. The hard work lives in retrieval quality, evaluation, latency, cost controls, permissions, observability, and user experience.",
      "That is why Andishi treats AI hiring as product engineering hiring. The best AI engineer for a startup can work across APIs, data, prompts, evaluation traces, background jobs, deployment, and interface states.",
      "Model fluency matters, but it is not enough. Production teams need engineers who can explain tradeoffs, measure behavior, and keep a feature useful after the launch announcement has faded.",
    ],
    status: "published" as const,
  },
  {
    slug: "what-vetting-should-prove",
    title: "What technical vetting should prove before an intro call",
    category: "Hiring" as const,
    excerpt:
      "Good vetting proves ownership, communication, system judgment, and production experience before the client spends time interviewing.",
    coverImage: "/images/blog-image-8.jpg",
    authorName: "Andishi Team",
    authorRole: "Talent Operations",
    authorAvatarUrl: "/logo.svg",
    datePublished: "2026-05-02",
    dateModified: "2026-05-08",
    readTime: 5,
    featured: false,
    body: [
      "A senior engineer profile should carry more signal than a title and a list of tools. It should show what the engineer has owned, how they communicate, and where their judgment has been tested.",
      "Andishi vetting looks for production history, system design thinking, code review clarity, architecture tradeoffs, and references where possible.",
      "The best intro call then becomes a focused technical conversation rather than a broad screening exercise.",
    ],
    status: "published" as const,
  },
  {
    slug: "scoping-a-fixed-price-build",
    title: "How we scope a fixed-price build without the change-order trap",
    category: "Engineering" as const,
    excerpt:
      "Fixed-price only works when the scope document does the arguing before the invoice does. Here's the structure we use.",
    coverImage: "/images/blog-image-2.jpg",
    authorName: "Ian Mwangi",
    authorRole: "Founder, Andishi",
    authorAvatarUrl: "/images/ian.jpg",
    datePublished: "2026-04-28",
    dateModified: "2026-04-28",
    readTime: 6,
    featured: false,
    body: [
      "Fixed-price engagements fail for a predictable reason: the scope document was vague enough that both sides could read it differently once work started.",
      "We scope against explicit acceptance criteria per milestone, not a feature list. A milestone is done when its criteria are demonstrably true, not when the engineer feels finished.",
      "Anything outside that criteria list is a change order by definition, agreed in writing before the sprint that touches it starts. This is what keeps a fixed-price build fixed.",
    ],
    status: "published" as const,
  },
  {
    slug: "remote-onboarding-first-week",
    title: "The first week: onboarding a remote engineer onto a live codebase",
    category: "Remote Work" as const,
    excerpt:
      "A senior hire's first week determines whether month two is productive or apologetic. Here's our onboarding checklist.",
    coverImage: "/images/blog-image-5.jpg",
    authorName: "Andishi Team",
    authorRole: "Engineering Notes",
    authorAvatarUrl: "/logo.svg",
    datePublished: "2026-04-20",
    dateModified: "2026-04-20",
    readTime: 4,
    featured: false,
    body: [
      "Most onboarding failures aren't skill gaps - they're context gaps. A senior engineer without access to the right docs, environments, and decision history will still move slowly in week one.",
      "We front-load repo access, environment setup, architecture docs, and a recorded walkthrough of the areas they'll own before day one, not during it.",
      "By the end of week one, the expectation is a merged PR, however small - proof the environment works and the engineer understands the review bar.",
    ],
    status: "published" as const,
  },
];

const DEFAULT_JOB_OPENINGS = [
  {
    title: "Senior AI Integration Engineer",
    slug: "senior-ai-integration-engineer",
    kind: "freelance" as const,
    department: "Engineering",
    location: "Nairobi, Kenya",
    remote: true,
    seniority: "Senior",
    compensationNote: "$8,000 - $12,000 / month",
    status: "open" as const,
    publishedAt: new Date("2026-06-20T10:00:00Z"),
    skills: ["Next.js", "Python", "OpenAI API", "LangChain", "pgvector", "TypeScript"],
    descriptionMd: `## The Role\nWe are seeking a **Senior AI Integration Engineer** to join our talent network on a freelance contract. You will design, build, and deploy RAG pipelines, custom LLM agents, and support workflow orchestrations for clients in SaaS and FinTech.\n\n## Responsibilities\n- Architect and implement RAG pipelines using vector stores\n- Integrate OpenAI, Anthropic, and open-source LLMs into production apps\n- Build LangChain-based agents with tool-use capabilities\n- Write clean, well-tested TypeScript/Python code`,
  },
  {
    title: "Full-Stack Product Engineer (Next.js + Node.js)",
    slug: "fullstack-product-engineer-nextjs",
    kind: "freelance" as const,
    department: "Engineering",
    location: "Nairobi, Kenya",
    remote: true,
    seniority: "Mid-Senior",
    compensationNote: "$5,000 - $9,000 / month",
    status: "open" as const,
    publishedAt: new Date("2026-06-15T10:00:00Z"),
    skills: ["Next.js", "React", "Node.js", "PostgreSQL", "TypeScript", "Drizzle ORM"],
    descriptionMd: `## The Role\nWe are looking for a **Full-Stack Product Engineer** to work on SaaS applications and client-facing platforms.\n\n## Responsibilities\n- Build full-stack features in Next.js 14+ App Router and Node.js\n- Design and maintain relational databases (PostgreSQL/Neon)\n- Integrate third-party APIs (Stripe, Resend, Twilio, etc.)\n- Deliver production-grade code`,
  },
  {
    title: "React Native Mobile Engineer",
    slug: "react-native-mobile-engineer",
    kind: "freelance" as const,
    department: "Engineering",
    location: "Remote — Africa",
    remote: true,
    seniority: "Senior",
    compensationNote: "$6,000 - $10,000 / month",
    status: "open" as const,
    publishedAt: new Date("2026-06-10T10:00:00Z"),
    skills: ["React Native", "Expo", "TypeScript", "Firebase", "M-Pesa", "iOS", "Android"],
    descriptionMd: `## The Role\nWe're seeking a **Senior React Native Mobile Engineer** to build cross-platform iOS and Android apps.\n\n## Responsibilities\n- Build and maintain React Native apps using Expo\n- Implement biometric auth, geolocation, offline-first sync\n- Integrate payment APIs (M-Pesa, Stripe, Flutterwave)`,
  },
  {
    title: "Senior Product Designer (UX/UI)",
    slug: "senior-product-designer-ux-ui",
    kind: "outsourced" as const,
    department: "Design",
    location: "Nairobi, Kenya",
    remote: true,
    seniority: "Lead / Senior",
    compensationNote: "Client-paid rate card: $65 - $85 / hour",
    status: "open" as const,
    publishedAt: new Date("2026-06-28T12:00:00Z"),
    skills: ["Figma", "UI Design System", "High-fidelity Prototyping", "UX Research"],
    descriptionMd: `## The Role\nAndishi is sourcing a **Senior Product Designer** for placement with a partner organization on their core product dashboard.\n\n## Responsibilities\n- Establish a refined design system inside Figma\n- Translate technical requirements into clean, production-ready UI\n- Produce high-fidelity components and interactive flows`,
  },
  {
    title: "Technical Recruiter & Talent Manager",
    slug: "technical-recruiter-talent-manager",
    kind: "internal" as const,
    department: "Operations",
    location: "Nairobi, Kenya",
    remote: false,
    seniority: "Mid-Senior",
    compensationNote: "Competitive salary + placement commissions",
    status: "draft" as const,
    publishedAt: null,
    skills: ["Technical Vetting", "Applicant Tracking", "Interviewing", "Operations"],
    descriptionMd: `## The Role\nWe are seeking a **Technical Recruiter & Talent Manager** to run the supply-side pipeline for Andishi's core team and external client channels.\n\n## Responsibilities\n- Screen, vet, and verify engineers applying to join Andishi's network\n- Manage recruitment pipelines and curate developer slates\n- Partner with client companies to scope talent needs`,
  },
];

// We seed a representative subset of the 20+ mock projects
const DEFAULT_PROJECTS = [
  {
    title: "Payment Reconciliation Engine",
    publicSlug: "payment-reconciliation-engine",
    description:
      "Custom backend operations layer unifying M-Pesa, cards, and callback handling for a B2B commerce startup.",
    status: "completed" as const,
    serviceType: "apis-integrations",
    vertical: "fintech",
    isPublic: true,
    coverImageUrl: "/images/project1.webp",
    challenge:
      "A fast-growing B2B commerce platform was processing payments across M-Pesa, card rails, and bank transfers using three disconnected systems with no single reconciliation view.",
    solution:
      "Built a unified payment abstraction layer that normalised all payment events into a single ledger with real-time callback handling and admin reporting.",
    outcome: "98.3%",
    outcomeLabel: "Payment match rate",
    clientName: "Lipa Commerce",
    stackTags: ["M-Pesa", "Webhooks", "PostgreSQL", "Node.js"],
    featuredOrder: 1,
    startDate: "2024-01-15",
    targetDate: "2024-02-20",
  },
  {
    title: "School Operations Platform",
    publicSlug: "school-operations-platform",
    description:
      "Multi-workspace school admin platform covering fee tracking, parent portals, RBAC, and M-Pesa integration across 12+ institutions.",
    status: "completed" as const,
    serviceType: "enterprise-software",
    vertical: "edtech",
    isPublic: true,
    coverImageUrl: "/images/project4.webp",
    challenge:
      "A school group managing 12 institutions ran fee collection on paper registers and WhatsApp messages — no audit trail, no central view, no automation.",
    solution:
      "Built a multi-workspace SaaS with per-school role-based access, automated M-Pesa collection, parent portals, and a central ops dashboard.",
    outcome: "12+",
    outcomeLabel: "Institutions onboarded",
    clientName: "MySchool Platform",
    stackTags: ["RBAC", "Parent portal", "M-Pesa", "MongoDB"],
    featuredOrder: 2,
    startDate: "2024-03-01",
    targetDate: "2024-03-22",
  },
  {
    title: "Fleet Management Engine",
    publicSlug: "fleet-management-engine",
    description:
      "Real-time cross-border logistics platform with route optimisation, React Native driver app, and automated border compliance checks.",
    status: "completed" as const,
    serviceType: "mobile-apps",
    vertical: "logistics",
    isPublic: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    challenge:
      "A cross-border logistics operator managed 450+ vehicles across 3 countries using SMS dispatches and manual border logs.",
    solution:
      "Built a real-time fleet platform with live GPS, route optimisation, border compliance checks, and an offline-capable React Native driver app.",
    outcome: "450+",
    outcomeLabel: "Vehicles managed daily",
    clientName: "Haraka Fleet",
    stackTags: ["React Native", "Geolocation", "Redis", "Routing"],
    featuredOrder: 3,
    startDate: "2024-04-01",
    targetDate: "2024-05-15",
  },
  {
    title: "AI Customer Support Agent",
    publicSlug: "ai-customer-support-agent",
    description:
      "Production LLM-powered support agent on Anthropic Claude with RAG over product docs and confidence-based human handoff.",
    status: "completed" as const,
    serviceType: "ai-systems",
    vertical: "saas",
    isPublic: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80",
    challenge:
      "A European SaaS company spent 40+ engineering hours per week on tier-1 support queries with deterministic answers in existing docs.",
    solution:
      "Built a RAG-based support agent on Claude with pgvector retrieval, confidence scoring, conversation memory, and structured human handoff workflows.",
    outcome: "71%",
    outcomeLabel: "Tickets auto-resolved",
    clientName: "Orbit Labs",
    stackTags: ["Anthropic", "RAG", "Pinecone", "LangChain"],
    featuredOrder: 4,
    startDate: "2025-01-10",
    targetDate: "2025-02-21",
  },
  {
    title: "Legal Document Analyzer",
    publicSlug: "legal-document-analyzer",
    description:
      "LLM-powered contract analysis tool that extracts clauses, surfaces risks, and generates executive summaries using RAG.",
    status: "completed" as const,
    serviceType: "ai-systems",
    vertical: "enterprise",
    isPublic: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    challenge: "A UK law firm's paralegal team spent 6-8 hours per large contract reviewing clauses for risk.",
    solution:
      "Built a RAG-powered contract analyzer using FastAPI + OpenAI + Pinecone that extracts clauses, flags risks by category, and generates executive summaries.",
    outcome: "85%",
    outcomeLabel: "Time saved per review",
    clientName: "Lex Meridian",
    stackTags: ["LLM", "RAG", "FastAPI", "Vector DB"],
    featuredOrder: 5,
    startDate: "2024-09-01",
    targetDate: "2024-10-01",
  },
  {
    title: "Contractor Billing SaaS",
    publicSlug: "contractor-billing-saas",
    description:
      "Multi-tenant invoicing platform for independent contractors with time tracking, client portals, and Stripe payouts.",
    status: "active" as const,
    serviceType: "saas-development",
    vertical: "saas",
    isPublic: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    challenge: "A bootstrapped SaaS founder needed a multi-tenant invoicing platform for independent contractors.",
    solution:
      "Built on Next.js + Stripe + Neon with multi-tenant workspace isolation, Stripe Connect payouts, time tracking, and auto-generated tax documents.",
    outcome: "2,800+",
    outcomeLabel: "Active contractors",
    clientName: "Workbill",
    stackTags: ["Next.js", "Stripe", "Multi-tenant", "Neon"],
    featuredOrder: 6,
    startDate: "2025-02-01",
    targetDate: "2025-04-15",
  },
];

// ─────────────────────────────────────────────────────────────
// Main seeder
// ─────────────────────────────────────────────────────────────

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to your .env.local file.");
  }

  console.log("🌱  Connecting to dev database...");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  // ── Testimonials ────────────────────────────────────────────────────
  console.log("\n📝  Seeding testimonials...");
  let testimonialCount = 0;
  for (const t of DEFAULT_TESTIMONIALS) {
    await db.insert(schema.testimonials).values(t).onConflictDoNothing();
    testimonialCount++;
  }
  console.log(`   ✓ ${testimonialCount} testimonials`);

  // ── Blog Posts ──────────────────────────────────────────────────────
  console.log("\n📰  Seeding blog posts...");
  let blogCount = 0;
  for (const p of DEFAULT_BLOG_POSTS) {
    await db.insert(schema.blogPosts).values(p).onConflictDoNothing();
    blogCount++;
  }
  console.log(`   ✓ ${blogCount} blog posts`);

  // ── Job Openings ────────────────────────────────────────────────────
  console.log("\n💼  Seeding job openings...");
  let jobCount = 0;
  for (const j of DEFAULT_JOB_OPENINGS) {
    await db.insert(schema.jobOpenings).values(j).onConflictDoNothing();
    jobCount++;
  }
  console.log(`   ✓ ${jobCount} job openings`);

  // ── Projects ─────────────────────────────────────────────────────────
  console.log("\n🏗️   Seeding case study projects...");

  // Find or create a seeder organization
  let orgId: string;
  const existingOrg = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(sql`name = 'Andishi Studio'`)
    .limit(1);

  if (existingOrg.length > 0 && existingOrg[0]) {
    orgId = existingOrg[0].id;
    console.log("   ↩  Reusing existing 'Andishi Studio' org");
  } else {
    const [org] = await db
      .insert(schema.organizations)
      .values({ name: "Andishi Studio" })
      .returning({ id: schema.organizations.id });
    if (!org) throw new Error("Failed to create seed organization");
    orgId = org.id;
    console.log("   ✓ Created 'Andishi Studio' org");
  }

  let projectCount = 0;
  for (const p of DEFAULT_PROJECTS) {
    await db
      .insert(schema.projects)
      .values({ ...p, organizationId: orgId })
      .onConflictDoNothing();
    projectCount++;
  }
  console.log(`   ✓ ${projectCount} case study projects`);

  await pool.end();
  console.log("\n✅  Dev seed complete.\n");
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err);
  process.exit(1);
});
