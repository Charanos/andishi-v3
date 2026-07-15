/**
 * scripts/seed-prod-content.ts
 *
 * One-off: seeds real, production-facing content onto the PRODUCTION Neon
 * branch - the one real job opening, 6 case-study projects, 6 testimonials,
 * and 3 blog posts. Unlike seed-dev.ts (placeholder/demo data for local
 * engineering use), everything inserted here is meant to be genuinely live.
 *
 * Run with: npx tsx --env-file=.env scripts/seed-prod-content.ts
 * Safe to re-run - uses onConflictDoNothing() on each unique slug.
 */

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "../src/db/schema";

neonConfig.webSocketConstructor = ws;

const JOB_OPENING = {
  title: "Freelance Product Analytics & Operations Consultant",
  slug: "freelance-product-analytics-operations-consultant",
  kind: "freelance" as const,
  department: "Product & Analytics",
  location: "Remote",
  remote: true,
  seniority: "Senior",
  compensationNote:
    "Freelance contract - rate based on experience and proposed weekly availability",
  status: "open" as const,
  publishedAt: new Date(),
  skills: [
    "SQL",
    "Snowflake",
    "Power BI",
    "Tableau",
    "Looker",
    "Product Analytics",
    "A/B Testing",
    "Cohort Analysis",
    "Data Visualization",
    "Python",
  ],
  descriptionMd: `**Engagement Type:** Freelance / Contract (Remote)

## Project Overview

We are seeking an experienced **Product Analytics & Operations Consultant** to support a technology-focused product operations initiative.

This engagement focuses on transforming product, customer, and operational data into actionable insights that improve product strategy, customer experience, feature adoption, retention, operational efficiency, and business growth.

The ideal consultant is highly analytical, comfortable working independently, and capable of owning the entire analytics lifecycle - from data discovery and SQL development to dashboard creation, insight generation, and executive reporting.

## Key Responsibilities

You will:

- Write, optimize, and maintain SQL queries against large product and operational datasets.
- Analyze product usage, customer behavior, feature adoption, engagement, retention, churn, and performance trends.
- Conduct funnel, cohort, segmentation, and customer lifecycle analyses.
- Define and maintain key product and operational KPIs.
- Design and maintain dashboards that monitor product performance, customer experience, growth, retention, profitability, and operational health.
- Identify trends, anomalies, risks, and opportunities within product and business data.
- Develop measurement frameworks for new product initiatives and strategic projects.
- Analyze A/B and multivariate experiments and communicate findings with clear recommendations.
- Support product planning through data-driven insights and performance reporting.
- Translate complex analyses into practical recommendations for business and product stakeholders.
- Prepare executive-ready reports, presentations, and documentation.
- Collaborate with Product, Engineering, UX, Finance, Sales, and Customer Success teams.
- Document metrics, data sources, methodologies, assumptions, and dashboard logic.
- Identify data quality issues and recommend improvements to reporting and measurement processes.

## Required Skills

Strong hands-on experience with:

- SQL
- Snowflake or another modern cloud data warehouse
- Power BI, Tableau, or Looker
- Product usage and behavioral analytics
- Dashboard development and KPI reporting
- Funnel, cohort, and segmentation analysis
- Feature adoption measurement
- Customer retention and churn analysis
- A/B testing and experimentation
- Data modeling and metric definition
- Data visualization and storytelling

## Preferred Qualifications

Experience with one or more of the following is an advantage:

- Python or R
- Gainsight PX or similar product analytics platforms
- SaaS or software product analytics
- Agile product development environments
- Product strategy and OKR frameworks
- Advanced statistical analysis
- Product event or telemetry data
- Customer lifecycle analytics

## Ideal Candidate

We're looking for someone with:

- 4+ years of experience in Product Analytics, Business Analytics, Product Operations, or a related field.
- Experience supporting Product Management or Product Operations teams.
- Experience working within SaaS, software, or technology organizations.
- Strong business acumen and the ability to connect data with strategic decisions.
- Excellent communication and presentation skills.
- The ability to explain analytical findings to both technical and non-technical stakeholders.
- Strong attention to detail and analytical accuracy.
- A proactive, ownership-oriented mindset with the ability to work independently.
- Experience collaborating with remote or distributed teams.

## Expected Deliverables

Deliverables may include:

- Optimized SQL queries and reusable analytical datasets
- Executive dashboards and KPI reporting
- Product performance and customer behavior reports
- Funnel, cohort, retention, and segmentation analyses
- Experiment measurement plans and A/B test evaluations
- Product health and operational performance reports
- Executive presentations and strategic recommendations
- Data quality assessments and reporting improvements
- Documentation covering metrics, assumptions, methodologies, and analytical processes

## Engagement Expectations

The consultant will independently own assigned workstreams and deliver high-quality, well-documented outputs.

Applicants should be prepared to discuss previous product analytics engagements, including:

- Business problems addressed
- SQL approaches used
- Metrics and KPIs developed
- Dashboards created
- Recommendations delivered
- Measurable business outcomes

## Application Requirements

Please include:

- A brief summary of your relevant experience
- Examples or portfolio of similar analytics projects
- Experience with SQL, Snowflake, and BI tools
- Your approach to product usage, adoption, retention, and customer analytics
- Experience designing or evaluating product experiments
- Weekly availability
- Preferred hourly or monthly contract rate
- Earliest available start date`,
};

const TESTIMONIALS = [
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
  {
    authorName: "Sarah Whitfield",
    authorRole: "Operations Director, Lex Meridian",
    content:
      "Andishi's contract analysis tool cut our paralegal review time by more than half in the first month. The RAG pipeline surfaces exactly the clauses our team needs to flag, and the executive summaries save partners hours before client calls.",
    avatarUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/legal-document-analyzer",
    rating: 5,
    date: "2026-06-02",
    status: "active" as const,
    featured: false,
    order: 5,
  },
  {
    authorName: "Marcus Chen",
    authorRole: "Founder, Workbill",
    content:
      "We needed a multi-tenant billing platform that could scale with our contractor base without falling over. Andishi delivered exactly that - clean Stripe Connect integration, solid tenant isolation, and code we've had no trouble extending ourselves since handoff.",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/contractor-billing-saas",
    rating: 5,
    date: "2026-06-20",
    status: "active" as const,
    featured: false,
    order: 6,
  },
];

const BLOG_POSTS = [
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
    ].join("\n\n"),
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
    ].join("\n\n"),
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
    ].join("\n\n"),
    status: "published" as const,
  },
];

const PROJECTS = [
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
      "A school group managing 12 institutions ran fee collection on paper registers and WhatsApp messages - no audit trail, no central view, no automation.",
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
    challenge:
      "A UK law firm's paralegal team spent 6-8 hours per large contract reviewing clauses for risk.",
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
    challenge:
      "A bootstrapped SaaS founder needed a multi-tenant invoicing platform for independent contractors.",
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

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set. Ensure .env (production) is loaded.");

  const host = new URL(databaseUrl).hostname;
  console.log(`Seeding production content onto: ${host}`);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  console.log("\nSeeding job opening...");
  await db.insert(schema.jobOpenings).values(JOB_OPENING).onConflictDoNothing();
  console.log("   done");

  console.log("\nSeeding testimonials...");
  for (const t of TESTIMONIALS) {
    await db.insert(schema.testimonials).values(t).onConflictDoNothing();
  }
  console.log(`   ${TESTIMONIALS.length} testimonials`);

  console.log("\nSeeding blog posts...");
  for (const p of BLOG_POSTS) {
    await db.insert(schema.blogPosts).values(p).onConflictDoNothing();
  }
  console.log(`   ${BLOG_POSTS.length} blog posts`);

  console.log("\nSeeding case study projects...");
  let orgId: string;
  const existingOrg = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(sql`name = 'Andishi Studio'`)
    .limit(1);

  if (existingOrg.length > 0 && existingOrg[0]) {
    orgId = existingOrg[0].id;
    console.log("   reusing existing 'Andishi Studio' org");
  } else {
    const [org] = await db
      .insert(schema.organizations)
      .values({ name: "Andishi Studio" })
      .returning({ id: schema.organizations.id });
    if (!org) throw new Error("Failed to create seed organization");
    orgId = org.id;
    console.log("   created 'Andishi Studio' org");
  }

  for (const p of PROJECTS) {
    await db
      .insert(schema.projects)
      .values({ ...p, organizationId: orgId })
      .onConflictDoNothing();
  }
  console.log(`   ${PROJECTS.length} projects`);

  await pool.end();
  console.log("\nProduction content seed complete.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
