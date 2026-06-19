import type { ServiceType } from "@/types/entities";

/**
 * Service line definitions for the software development studio.
 * Used by:
 *  - /services hub page (ServiceCard grid)
 *  - /services/[slug] sub-pages
 *  - Homepage Section 4 services grid
 *  - serviceType values in briefs and projects schemas
 *
 * Ordered by public prominence per V3_CURRENT_STATE_AUDIT_REVISED.md
 */
export interface ServiceDefinition {
  slug: ServiceType;
  title: string;
  description: string;
  icon: string;      // Tabler icon component name (e.g. "IconDeviceDesktop")
  timeline: string;      // e.g. "4–10 weeks" - displayed as JetBrains Mono chip
  glow: "violet" | "cyan" | "amber";
  group: "product-delivery" | "specialist-builds";
  tagline: string;      // Short one-liner for meta/OG descriptions
  // Detail page content
  scope: string;      // Paragraph describing full scope
  engagementOptions: EngagementOption[];
  faq: ServiceFaq[];
  stackHighlights: string[]; // Representative tech tags
}

export interface EngagementOption {
  label: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export const services: ServiceDefinition[] = [
  // ── Group A - Product Delivery ────────────────────────────────

  {
    slug: "custom-software",
    title: "Web Applications",
    description:
      "Custom-built web products for businesses that have outgrown off-the-shelf tools. We scope, design, build, and hand over production-ready systems.",
    icon: "IconDeviceDesktop",
    timeline: "4–10 weeks",
    glow: "violet",
    group: "product-delivery",
    tagline: "Production-ready web software, scoped and shipped.",
    scope:
      "End-to-end design, build, and delivery of custom web applications. We handle product strategy, UX design, frontend, backend, database, and deployment. You receive a fully documented, production-ready system with IP ownership from day one.",
    engagementOptions: [
      {
        label: "Fixed scope",
        description: "Defined deliverables, fixed timeline, fixed price. Best for well-understood products.",
      },
      {
        label: "Sprint-based",
        description: "Iterative delivery in 2-week sprints. Best for evolving requirements.",
      },
    ],
    faq: [
      {
        question: "What kinds of web apps do you build?",
        answer: "Internal tools, client portals, operations platforms, marketplaces, dashboards, and custom workflow systems. If it's web-based and needs to be purpose-built, it's in scope.",
      },
      {
        question: "Do I need to provide a spec?",
        answer: "No. One scoping call is enough. We write the brief, you approve it.",
      },
      {
        question: "What happens after you ship?",
        answer: "30 days of included support post-launch. After that, we offer optional retainer-based maintenance.",
      },
    ],
    stackHighlights: ["Next.js", "React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
  },

  {
    slug: "saas-development",
    title: "SaaS Products",
    description:
      "From MVP to multi-tenant platform. We design the product architecture, build it, and ship it - with the technical foundations to scale.",
    icon: "IconCode",
    timeline: "6–14 weeks",
    glow: "violet",
    group: "product-delivery",
    tagline: "SaaS MVPs to multi-tenant platforms, architected to scale.",
    scope:
      "Full SaaS product development from concept through launch. Includes product strategy, architecture design, UX, multi-tenancy implementation, auth, billing integrations, and deployment. We build the version that can scale, not the version that will need a rewrite in six months.",
    engagementOptions: [
      {
        label: "MVP to launch",
        description: "Core feature set shipped and live. Best for first-time founders validating a product.",
      },
      {
        label: "Platform build",
        description: "Full multi-tenant architecture with admin, billing, and growth infrastructure.",
      },
    ],
    faq: [
      {
        question: "How do you approach SaaS architecture?",
        answer: "We design for multi-tenancy, data isolation, and horizontal scaling from the start. We don't cut corners that require painful migrations later.",
      },
      {
        question: "Do you handle billing integration?",
        answer: "Yes. We implement Stripe subscription billing as a standard part of SaaS builds.",
      },
      {
        question: "What's the typical team size?",
        answer: "2–4 engineers depending on scope, led by a senior engineer who communicates directly with you.",
      },
    ],
    stackHighlights: ["Next.js", "Stripe", "PostgreSQL", "Redis", "Vercel", "Neon"],
  },

  {
    slug: "mobile-apps",
    title: "Mobile Applications",
    description:
      "iOS and Android apps built for real usage patterns. Native or cross-platform, depending on what the product actually needs.",
    icon: "IconDeviceMobile",
    timeline: "6–12 weeks",
    glow: "violet",
    group: "product-delivery",
    tagline: "Mobile apps built for how people actually use their phones.",
    scope:
      "Mobile application development for iOS and Android. We evaluate your product requirements and recommend React Native (cross-platform) or native Swift/Kotlin based on what the product genuinely needs - not what's easier to build.",
    engagementOptions: [
      {
        label: "Cross-platform",
        description: "Single codebase for iOS and Android via React Native. Faster, more cost-effective for most products.",
      },
      {
        label: "Native",
        description: "Platform-specific Swift or Kotlin for products that require hardware-level integration or performance.",
      },
    ],
    faq: [
      {
        question: "React Native or native - how do you decide?",
        answer: "We ask what the product genuinely needs. If it's UI-heavy with standard device features, React Native. If it requires camera, sensors, or custom OS-level integration, native.",
      },
      {
        question: "Do you handle App Store and Play Store submission?",
        answer: "Yes. We prepare and submit to both stores and handle the review process.",
      },
    ],
    stackHighlights: ["React Native", "Expo", "Swift", "Kotlin", "Firebase", "REST APIs"],
  },

  {
    slug: "ai-systems",
    title: "AI & Intelligent Systems",
    description:
      "LLM integrations, AI-powered features, and intelligent automation built into production software. Not demos - shipped products.",
    icon: "IconBrain",
    timeline: "3–8 weeks",
    glow: "violet",
    group: "product-delivery",
    tagline: "AI built into your product, not bolted on.",
    scope:
      "AI product development and intelligent systems integration. We build LLM-powered features, RAG pipelines, AI agents, and automation workflows directly into production software. Every integration is built to production standards - observable, testable, and maintainable.",
    engagementOptions: [
      {
        label: "AI feature integration",
        description: "Add AI-powered features to an existing product. Typically 3–6 weeks.",
      },
      {
        label: "AI-native product",
        description: "Build a product with AI as a core architectural component from the ground up.",
      },
    ],
    faq: [
      {
        question: "Which AI/LLM providers do you work with?",
        answer: "OpenAI, Anthropic, Google Gemini, Mistral, and local/open-source models via Ollama. We're provider-agnostic and recommend based on your cost, latency, and privacy requirements.",
      },
      {
        question: "What does 'production AI' actually mean?",
        answer: "Structured outputs, deterministic behavior where needed, fallback handling, prompt versioning, cost monitoring, and evaluation pipelines - not a prototype that works 80% of the time.",
      },
    ],
    stackHighlights: ["OpenAI", "Anthropic", "LangChain", "Pinecone", "Python", "TypeScript"],
  },

  // ── Group B - Specialist Builds ───────────────────────────────

  {
    slug: "enterprise-software",
    title: "Enterprise Software",
    description:
      "Internal platforms, workflow systems, and business tools that replace spreadsheets and manual processes at scale.",
    icon: "IconBuildingSkyscraper",
    timeline: "8–20 weeks",
    glow: "cyan",
    group: "specialist-builds",
    tagline: "Business software that replaces the spreadsheets people hate.",
    scope:
      "End-to-end enterprise software development: internal platforms, operations tools, ERP modules, HR systems, reporting dashboards, and workflow automation. Built to handle real data volumes, role-based access, and audit requirements.",
    engagementOptions: [
      {
        label: "Greenfield platform",
        description: "Full build from scratch. We design the data model, architecture, and UX.",
      },
      {
        label: "Legacy modernisation",
        description: "Rebuild or extend an existing system. We assess what to keep, what to replace, and what to integrate.",
      },
    ],
    faq: [
      {
        question: "Can you integrate with our existing systems?",
        answer: "Yes. Enterprise builds typically involve integrations with ERP systems, CRMs, accounting software, and third-party APIs. We scope integrations as part of the initial brief.",
      },
      {
        question: "How do you handle data migration?",
        answer: "We plan and execute data migration as part of the project. We never hand over a system without the data it needs to run.",
      },
    ],
    stackHighlights: ["Next.js", "PostgreSQL", "Python", "REST APIs", "AWS", "Docker"],
  },

  {
    slug: "blockchain",
    title: "Blockchain & Web3",
    description:
      "Smart contracts, on-chain integrations, DeFi tooling, and token-gated product features. Production-level, not tutorial-level.",
    icon: "IconCurrencyBitcoin",
    timeline: "4–12 weeks",
    glow: "cyan",
    group: "specialist-builds",
    tagline: "On-chain products built to production standards.",
    scope:
      "Blockchain and Web3 product development: smart contract development and auditing, DeFi protocol integrations, token-gated features, NFT platforms, and full-stack Web3 applications. We build on Ethereum, Polygon, Solana, and compatible chains.",
    engagementOptions: [
      {
        label: "Smart contract development",
        description: "Solidity contracts with testing, auditing preparation, and deployment. Includes frontend integration.",
      },
      {
        label: "Web3 product build",
        description: "Full-stack application with wallet integration, on-chain reads/writes, and a standard web frontend.",
      },
    ],
    faq: [
      {
        question: "Which chains do you work with?",
        answer: "Ethereum mainnet, Polygon, Base, Arbitrum, and Solana. We evaluate chain selection based on your product's transaction volume, cost requirements, and ecosystem.",
      },
      {
        question: "Do you provide contract audits?",
        answer: "We prepare contracts for audit and can coordinate with third-party auditors. We do not provide final security audits in-house.",
      },
    ],
    stackHighlights: ["Solidity", "Hardhat", "ethers.js", "wagmi", "The Graph", "IPFS"],
  },

  {
    slug: "apis-integrations",
    title: "APIs & Integrations",
    description:
      "Backend systems, data pipelines, and service integrations that connect your tools and eliminate manual work.",
    icon: "IconCircuitBoard",
    timeline: "2–6 weeks",
    glow: "cyan",
    group: "specialist-builds",
    tagline: "The backend work that makes everything else actually work.",
    scope:
      "API development and third-party integration engineering. We build REST and GraphQL APIs, webhook systems, data pipelines, ETL processes, and integrations between SaaS tools, payment processors, communication platforms, and internal databases.",
    engagementOptions: [
      {
        label: "API build",
        description: "Greenfield REST or GraphQL API with auth, rate limiting, and documentation.",
      },
      {
        label: "Integration sprint",
        description: "Connect existing systems that don't talk to each other. Scoped as a fixed integration project.",
      },
    ],
    faq: [
      {
        question: "What integrations do you commonly build?",
        answer: "Stripe, Twilio, Resend, Slack, HubSpot, Salesforce, Google Workspace, M-Pesa, and custom internal APIs. Most integration projects have a clear scope and a defined timeline.",
      },
      {
        question: "Do you write API documentation?",
        answer: "Yes. We provide OpenAPI/Swagger documentation as a standard deliverable on all API builds.",
      },
    ],
    stackHighlights: ["Node.js", "Python", "REST", "GraphQL", "Webhooks", "PostgreSQL"],
  },

  {
    slug: "product-strategy",
    title: "Product Strategy & Design",
    description:
      "Scope definition, information architecture, UX design, and technical advisory for founders who need to make the right product decisions before building.",
    icon: "IconCloudComputing",
    timeline: "1–3 weeks",
    glow: "cyan",
    group: "specialist-builds",
    tagline: "Get the product right before the first line of code.",
    scope:
      "Product strategy, UX design, and technical architecture advisory. We work with founders and product leads to define scope, create information architecture, produce UX wireframes and prototypes, and produce a technical blueprint ready for engineering.",
    engagementOptions: [
      {
        label: "Scoping sprint",
        description: "1-week intensive to define product scope, validate assumptions, and produce a build brief.",
      },
      {
        label: "Design + blueprint",
        description: "Full UX design through to high-fidelity prototype and technical architecture document.",
      },
    ],
    faq: [
      {
        question: "Do I need this before starting a build?",
        answer: "Not always. For well-defined products, we can scope during our first call. For complex products or founders who've never built software before, a dedicated strategy sprint prevents expensive course corrections later.",
      },
      {
        question: "Can you continue to the build phase after this?",
        answer: "Yes. Most strategy engagements transition directly into a build project with the same team.",
      },
    ],
    stackHighlights: ["Figma", "Miro", "System design", "UX research", "Technical specs"],
  },
];

/**
 * Returns a single service definition by slug.
 * Returns undefined if the slug is not found.
 */
export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return services.find((s) => s.slug === slug);
}

/**
 * Returns services filtered by group.
 */
export function getServicesByGroup(
  group: ServiceDefinition["group"],
): ServiceDefinition[] {
  return services.filter((s) => s.group === group);
}

/**
 * Returns all service slugs - used for Next.js generateStaticParams.
 */
export function getAllServiceSlugs(): ServiceType[] {
  return services.map((s) => s.slug);
}
