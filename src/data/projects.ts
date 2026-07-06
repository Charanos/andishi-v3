import type { ServiceType } from "@/types/entities";

export interface ProjectEntry {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  industry: string;
  location: string;
  timeline: string;
  stack: string;
  status: "Completed" | "Live" | "In Progress";
  resultValue: string;
  resultLabel: string;
  resultContext: string;
  tags: string[];
  image: string;
  services: ServiceType[];
  year: string;
  accent?: string;
}

export const projects: ProjectEntry[] = [
  // ── Reused from showcase ─────────────────────────────────────────

  {
    slug: "payment-reconciliation-engine",
    title: "Payment Reconciliation Engine",
    eyebrow: "Fintech / Nairobi",
    summary:
      "Custom backend operations layer unifying M-Pesa, cards, and callback handling for a B2B commerce startup - with real-time reconciliation and admin reporting.",
    industry: "Fintech",
    location: "Nairobi",
    timeline: "5 weeks",
    stack: "Next.js + Node.js + PostgreSQL",
    status: "Completed",
    resultValue: "98.3%",
    resultLabel: "Payment match rate",
    resultContext: "M-Pesa records reconciled",
    tags: ["M-Pesa", "Webhooks", "PostgreSQL", "Node.js"],
    image: "/images/project1.webp",
    services: ["custom-software", "apis-integrations"],
    year: "2024",
  },

  {
    slug: "school-operations-platform",
    title: "School Operations Platform",
    eyebrow: "EdTech / Kenya",
    summary:
      "Multi-workspace school admin platform covering fee tracking, parent communication portals, role-based access, and direct M-Pesa integration across 12+ institutions.",
    industry: "EdTech",
    location: "Kenya",
    timeline: "3 weeks",
    stack: "Next.js + MongoDB",
    status: "Completed",
    resultValue: "12+",
    resultLabel: "Institutions onboarded",
    resultContext: "across Nairobi county",
    tags: ["RBAC", "Parent portal", "M-Pesa", "MongoDB"],
    image: "/images/project4.webp",
    services: ["custom-software", "enterprise-software"],
    year: "2024",
  },

  {
    slug: "operations-analytics-dashboard",
    title: "Operations Analytics Dashboard",
    eyebrow: "SaaS / Analytics",
    summary:
      "Analytics layer and data pipeline connecting operational tools into real-time reporting metrics - built for weekly leadership decisions at a global SaaS company.",
    industry: "SaaS",
    location: "Global",
    timeline: "4 weeks",
    stack: "React + Node.js + PostgreSQL",
    status: "Completed",
    resultValue: "41%",
    resultLabel: "Faster decision cycle",
    resultContext: "across reporting workflows",
    tags: ["Dashboards", "Data pipeline", "API", "Charts"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    services: ["saas-development", "custom-software"],
    year: "2024",
  },

  {
    slug: "fleet-management-engine",
    title: "Fleet Management Engine",
    eyebrow: "Logistics / East Africa",
    summary:
      "Real-time cross-border logistics platform with route optimisation, React Native driver app, and automated border compliance checks for a regional logistics operator.",
    industry: "Logistics",
    location: "East Africa",
    timeline: "6 weeks",
    stack: "React Native + Node.js + Redis",
    status: "Completed",
    resultValue: "450+",
    resultLabel: "Vehicles managed daily",
    resultContext: "across 3 countries",
    tags: ["React Native", "Geolocation", "Redis", "Routing"],
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    services: ["mobile-apps", "enterprise-software"],
    year: "2024",
  },

  {
    slug: "patient-operations-portal",
    title: "Patient Operations Portal",
    eyebrow: "Healthcare / Global",
    summary:
      "HIPAA-compliant patient portal connecting doctors, lab results, and pharmacy prescriptions - with WebRTC video consultations and appointment booking flows.",
    industry: "Healthcare",
    location: "Global",
    timeline: "8 weeks",
    stack: "Next.js + PostgreSQL + WebRTC",
    status: "Completed",
    resultValue: "10k+",
    resultLabel: "Monthly consultations",
    resultContext: "active sessions at launch",
    tags: ["WebRTC", "HIPAA", "Video Calls", "Booking"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    services: ["custom-software", "saas-development"],
    year: "2024",
  },

  {
    slug: "wholesale-ordering-platform",
    title: "Wholesale Ordering Platform",
    eyebrow: "E-Commerce / Kenya",
    summary:
      "B2B procurement storefront integrating with a legacy ERP system to handle tiered pricing, bulk orders, credit limits, and real-time inventory across multiple warehouses.",
    industry: "Retail",
    location: "Kenya",
    timeline: "5 weeks",
    stack: "Vue.js + Python + GraphQL",
    status: "Completed",
    resultValue: "$2.4M",
    resultLabel: "GMV processed",
    resultContext: "in the first operating quarter",
    tags: ["GraphQL", "ERP integration", "B2B", "Python"],
    image:
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=1200&q=80",
    services: ["enterprise-software", "apis-integrations"],
    year: "2024",
  },

  {
    slug: "legal-document-analyzer",
    title: "Legal Document Analyzer",
    eyebrow: "LegalTech / UK",
    summary:
      "LLM-powered internal tool for a law firm that extracts clauses, surfaces contractual risks, and generates executive summaries from large contract datasets using RAG.",
    industry: "LegalTech",
    location: "UK",
    timeline: "4 weeks",
    stack: "React + FastAPI + OpenAI + Pinecone",
    status: "Completed",
    resultValue: "85%",
    resultLabel: "Time saved per review",
    resultContext: "vs. manual document analysis",
    tags: ["LLM", "RAG", "FastAPI", "Vector DB"],
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    services: ["ai-systems"],
    year: "2024",
  },

  // ── New projects ─────────────────────────────────────────────────

  {
    slug: "contractor-management-platform",
    title: "Contractor Management Platform",
    eyebrow: "Construction / South Africa",
    summary:
      "Project management web app for a construction firm to track contractor assignments, stage completions, and payment milestones across 14 active sites simultaneously.",
    industry: "Construction",
    location: "South Africa",
    timeline: "7 weeks",
    stack: "Next.js + NestJS + PostgreSQL",
    status: "Completed",
    resultValue: "340+",
    resultLabel: "Contractors managed",
    resultContext: "across 14 concurrent sites",
    tags: ["Next.js", "NestJS", "PostgreSQL", "RBAC"],
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    services: ["custom-software"],
    year: "2025",
  },

  {
    slug: "real-estate-operations-hub",
    title: "Real Estate Operations Hub",
    eyebrow: "Proptech / UAE",
    summary:
      "Property management platform for a UAE-based firm handling listing workflows, tenant onboarding, lease renewals, and multi-currency payment tracking at scale.",
    industry: "Proptech",
    location: "UAE",
    timeline: "9 weeks",
    stack: "Next.js + Supabase + Stripe",
    status: "Completed",
    resultValue: "1,200+",
    resultLabel: "Properties managed",
    resultContext: "on a single unified platform",
    tags: ["Next.js", "Supabase", "Stripe", "Multi-currency"],
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    services: ["custom-software", "saas-development"],
    year: "2025",
  },

  {
    slug: "contractor-billing-saas",
    title: "Contractor Billing SaaS",
    eyebrow: "SaaS / North America",
    summary:
      "Multi-tenant invoicing and billing platform for independent contractors with time tracking, client portals, Stripe-based payouts, and automatic tax document generation.",
    industry: "SaaS",
    location: "North America",
    timeline: "10 weeks",
    stack: "Next.js + Stripe + PostgreSQL + Neon",
    status: "Live",
    resultValue: "2,800+",
    resultLabel: "Active contractors",
    resultContext: "processing invoices monthly",
    tags: ["Next.js", "Stripe", "Multi-tenant", "Neon"],
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    services: ["saas-development"],
    year: "2025",
  },

  {
    slug: "learning-management-system",
    title: "Online Learning Platform",
    eyebrow: "EdTech / Global",
    summary:
      "Multi-tenant LMS with video course delivery, cohort-based learning, progress tracking, certificate generation, and Stripe subscription billing for 60+ course creators.",
    industry: "EdTech",
    location: "Global",
    timeline: "12 weeks",
    stack: "Next.js + Mux + PostgreSQL + Stripe",
    status: "Live",
    resultValue: "18k+",
    resultLabel: "Enrolled learners",
    resultContext: "across 60+ course creators",
    tags: ["Mux video", "Stripe", "Multi-tenant", "Next.js"],
    image:
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
    services: ["saas-development"],
    year: "2025",
  },

  {
    slug: "mobile-banking-app",
    title: "Instant Mobile Banking App",
    eyebrow: "Fintech / Nigeria",
    summary:
      "React Native banking application for a Nigerian fintech with instant transfers, P2P payments, savings goals, and POS integration - sub-3s transaction confirmation.",
    industry: "Fintech",
    location: "Nigeria",
    timeline: "10 weeks",
    stack: "React Native + Expo + Node.js + PostgreSQL",
    status: "Live",
    resultValue: "< 3s",
    resultLabel: "Transaction confirmation",
    resultContext: "across P2P and POS channels",
    tags: ["React Native", "Expo", "Biometrics", "POS"],
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
    services: ["mobile-apps"],
    year: "2025",
  },

  {
    slug: "field-service-technician-app",
    title: "Field Service Technician App",
    eyebrow: "Infrastructure / Kenya",
    summary:
      "Offline-first React Native app for 200+ field technicians with job assignment, photo evidence collection, offline form submissions, and background GPS tracking with auto-sync.",
    industry: "Infrastructure",
    location: "Kenya",
    timeline: "8 weeks",
    stack: "React Native + SQLite + Node.js + AWS",
    status: "Completed",
    resultValue: "62%",
    resultLabel: "Fewer missed jobs",
    resultContext: "vs. SMS dispatch system",
    tags: ["React Native", "Offline-first", "SQLite", "GPS"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    services: ["mobile-apps"],
    year: "2025",
  },

  {
    slug: "community-marketplace-app",
    title: "Community Marketplace App",
    eyebrow: "Consumer / East Africa",
    summary:
      "Cross-platform iOS and Android marketplace for local artisans to list handmade goods with in-app M-Pesa checkout, seller ratings, and an algorithmic discovery feed.",
    industry: "Consumer",
    location: "East Africa",
    timeline: "9 weeks",
    stack: "React Native + Expo + Firebase + M-Pesa",
    status: "Live",
    resultValue: "4,500+",
    resultLabel: "Active sellers",
    resultContext: "within 60 days of launch",
    tags: ["React Native", "Firebase", "M-Pesa", "Expo"],
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    services: ["mobile-apps"],
    year: "2025",
  },

  {
    slug: "ai-customer-support-agent",
    title: "AI Customer Support Agent",
    eyebrow: "SaaS / Europe",
    summary:
      "Production LLM-powered support agent on Anthropic Claude handling tier-1 customer queries with RAG over product documentation and confidence-based human handoff.",
    industry: "SaaS",
    location: "Europe",
    timeline: "6 weeks",
    stack: "Next.js + Anthropic Claude + Pinecone + PostgreSQL",
    status: "Live",
    resultValue: "71%",
    resultLabel: "Tickets auto-resolved",
    resultContext: "without human escalation",
    tags: ["Anthropic", "RAG", "Pinecone", "LangChain"],
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80",
    services: ["ai-systems"],
    year: "2025",
  },

  {
    slug: "predictive-churn-analytics",
    title: "Predictive Churn Analytics Engine",
    eyebrow: "SaaS / North America",
    summary:
      "Python ML pipeline predicting SaaS customer churn 45 days in advance, integrated into the product dashboard and triggering automated retention workflows via CRM webhooks.",
    industry: "SaaS",
    location: "North America",
    timeline: "5 weeks",
    stack: "Python + scikit-learn + FastAPI + Airflow",
    status: "Live",
    resultValue: "45 days",
    resultLabel: "Churn prediction horizon",
    resultContext: "with 89% precision on holdout data",
    tags: ["Python", "scikit-learn", "FastAPI", "Airflow"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    services: ["ai-systems"],
    year: "2025",
  },

  {
    slug: "content-intelligence-platform",
    title: "Content Intelligence Platform",
    eyebrow: "Media / UK",
    summary:
      "AI-native content operations platform classifying, summarising, and routing incoming media briefs through a multi-model pipeline with a structured editorial review layer.",
    industry: "Media",
    location: "UK",
    timeline: "7 weeks",
    stack: "Next.js + OpenAI + LangChain + PostgreSQL",
    status: "Completed",
    resultValue: "5×",
    resultLabel: "Content throughput",
    resultContext: "per editor vs. manual workflow",
    tags: ["LangChain", "OpenAI", "Next.js", "Structured output"],
    image:
      "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=1200&q=80",
    services: ["ai-systems"],
    year: "2025",
  },

  {
    slug: "hr-payroll-management-suite",
    title: "HR & Payroll Management Suite",
    eyebrow: "Enterprise / Ghana",
    summary:
      "Multi-entity HR platform for a 900-employee Ghanaian conglomerate covering onboarding, payroll, leave management, performance reviews, and statutory SSNIT compliance.",
    industry: "Enterprise",
    location: "Ghana",
    timeline: "14 weeks",
    stack: "Next.js + NestJS + PostgreSQL + AWS",
    status: "Completed",
    resultValue: "900+",
    resultLabel: "Employees on platform",
    resultContext: "across 4 business entities",
    tags: ["NestJS", "PostgreSQL", "AWS", "Compliance"],
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    services: ["enterprise-software"],
    year: "2025",
  },

  {
    slug: "construction-project-tracker",
    title: "Construction Project Tracker",
    eyebrow: "Construction / East Africa",
    summary:
      "Multi-site project management system handling RFIs, bill of quantities, subcontractor management, and real-time site progress reporting across 8 concurrent projects.",
    industry: "Construction",
    location: "East Africa",
    timeline: "11 weeks",
    stack: "Next.js + PostgreSQL + AWS S3 + Docker",
    status: "Live",
    resultValue: "28%",
    resultLabel: "Reduction in overruns",
    resultContext: "across 8 concurrent projects",
    tags: ["Next.js", "AWS S3", "Docker", "PostgreSQL"],
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    services: ["enterprise-software"],
    year: "2025",
  },

  {
    slug: "defi-yield-protocol-interface",
    title: "DeFi Yield Protocol Interface",
    eyebrow: "Web3 / Global",
    summary:
      "Front-end dApp for a decentralised yield aggregator on Ethereum and Arbitrum with real-time APY display, vault deposit flows, and wallet-aware transaction tracking.",
    industry: "DeFi",
    location: "Global",
    timeline: "5 weeks",
    stack: "Next.js + wagmi + viem + Hardhat",
    status: "Live",
    resultValue: "$4.2M",
    resultLabel: "TVL at launch",
    resultContext: "within the first 30 days",
    tags: ["wagmi", "viem", "Ethereum", "Arbitrum"],
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
    services: ["blockchain"],
    year: "2025",
  },

  {
    slug: "nft-creator-marketplace",
    title: "NFT Creator Marketplace",
    eyebrow: "Web3 / UAE",
    summary:
      "Full-stack NFT marketplace on Polygon where creators mint, list, and auction digital art. Features royalty enforcement, lazy minting, and a fiat on-ramp integration.",
    industry: "Web3",
    location: "UAE",
    timeline: "8 weeks",
    stack: "Next.js + Solidity + IPFS + The Graph",
    status: "Live",
    resultValue: "8,400+",
    resultLabel: "NFTs minted",
    resultContext: "across 220 creator collections",
    tags: ["Solidity", "IPFS", "The Graph", "Polygon"],
    image:
      "https://images.unsplash.com/photo-1645543523697-7b79f00d2ebe?auto=format&fit=crop&w=1200&q=80",
    services: ["blockchain"],
    year: "2025",
  },

  {
    slug: "dao-governance-platform",
    title: "DAO Governance Platform",
    eyebrow: "Web3 / Global",
    summary:
      "On-chain governance interface for a DAO managing a $14M community treasury with token-weighted proposal voting, delegation, quorum tracking, and Gnosis Safe execution.",
    industry: "Web3",
    location: "Global",
    timeline: "6 weeks",
    stack: "Next.js + Solidity + Gnosis Safe + wagmi",
    status: "Completed",
    resultValue: "$14M",
    resultLabel: "Treasury governed",
    resultContext: "across 3,200 token holders",
    tags: ["Solidity", "Gnosis Safe", "wagmi", "DAO"],
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1200&q=80",
    services: ["blockchain"],
    year: "2025",
  },

  {
    slug: "cross-chain-bridge-ui",
    title: "Cross-Chain Bridge Interface",
    eyebrow: "Web3 / Global",
    summary:
      "Production front-end for a cross-chain asset bridge connecting Ethereum, Polygon, and Base - with transaction tracking, fee estimation, and slippage protection.",
    industry: "Web3",
    location: "Global",
    timeline: "4 weeks",
    stack: "Next.js + wagmi + ethers.js + Alchemy",
    status: "Live",
    resultValue: "$28M+",
    resultLabel: "Assets bridged",
    resultContext: "in the first operating month",
    tags: ["wagmi", "ethers.js", "Alchemy", "Base"],
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
    services: ["blockchain"],
    year: "2025",
  },

  {
    slug: "payment-gateway-aggregator-api",
    title: "Payment Gateway Aggregator API",
    eyebrow: "Fintech / East Africa",
    summary:
      "Unified payment abstraction API routing transactions across M-Pesa, Stripe, Flutterwave, and Airtel Money with automatic failover, retry logic, and a single reconciliation feed.",
    industry: "Fintech",
    location: "East Africa",
    timeline: "6 weeks",
    stack: "Node.js + PostgreSQL + Redis + AWS",
    status: "Live",
    resultValue: "99.97%",
    resultLabel: "Successful transaction rate",
    resultContext: "at sub-400ms average latency",
    tags: ["M-Pesa", "Stripe", "Flutterwave", "Redis"],
    image:
      "https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=1200&q=80",
    services: ["apis-integrations"],
    year: "2025",
  },

  {
    slug: "multi-crm-integration-pipeline",
    title: "Multi-CRM Data Sync Pipeline",
    eyebrow: "SaaS / Europe",
    summary:
      "Bi-directional data sync engine between HubSpot, Salesforce, and a proprietary CRM - handling conflict resolution, field mapping, webhook triggers, and a full audit trail.",
    industry: "SaaS",
    location: "Europe",
    timeline: "4 weeks",
    stack: "Node.js + PostgreSQL + HubSpot API + Salesforce API",
    status: "Completed",
    resultValue: "180k+",
    resultLabel: "Records synced daily",
    resultContext: "across 3 CRM systems",
    tags: ["HubSpot", "Salesforce", "Node.js", "Webhooks"],
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    services: ["apis-integrations"],
    year: "2025",
  },

  {
    slug: "webhook-event-processing-engine",
    title: "Webhook Event Processing Engine",
    eyebrow: "Infrastructure / Global",
    summary:
      "Horizontally-scalable webhook processor ingesting, validating, deduplicating, and fanning out events from 12 upstream SaaS providers with guaranteed at-least-once delivery.",
    industry: "Infrastructure",
    location: "Global",
    timeline: "3 weeks",
    stack: "Node.js + BullMQ + Redis + PostgreSQL",
    status: "Live",
    resultValue: "2M+",
    resultLabel: "Events processed daily",
    resultContext: "with zero missed deliveries",
    tags: ["BullMQ", "Redis", "Node.js", "PostgreSQL"],
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    services: ["apis-integrations"],
    year: "2025",
  },

  {
    slug: "agri-finance-platform-blueprint",
    title: "Agri-Finance Platform Blueprint",
    eyebrow: "Product Strategy / Kenya",
    summary:
      "1-week product strategy sprint for a Kenyan agri-finance startup. Delivered a product brief, system architecture diagram, UX wireframes, and a full development cost estimate.",
    industry: "AgriFintech",
    location: "Kenya",
    timeline: "1 week",
    stack: "Figma + Miro + System design",
    status: "Completed",
    resultValue: "1 week",
    resultLabel: "From zero to launch-ready brief",
    resultContext: "with full technical architecture",
    tags: ["Figma", "System design", "UX research", "Miro"],
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    services: ["product-strategy"],
    year: "2025",
  },

  {
    slug: "healthcare-mvp-blueprint",
    title: "Healthcare Startup MVP Blueprint",
    eyebrow: "Product Strategy / UK",
    summary:
      "3-week design and architecture engagement for a UK telehealth startup. Produced high-fidelity Figma prototypes, HIPAA-aligned data architecture, and a 14-week phased roadmap.",
    industry: "Healthcare",
    location: "UK",
    timeline: "3 weeks",
    stack: "Figma + Technical spec + Architecture diagram",
    status: "Completed",
    resultValue: "£420k",
    resultLabel: "Investment raised",
    resultContext: "using our blueprint as the pitch deck technical annex",
    tags: ["Figma", "HIPAA", "Architecture", "Roadmapping"],
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    services: ["product-strategy"],
    year: "2025",
  },

  {
    slug: "b2b-saas-information-architecture",
    title: "B2B SaaS Information Architecture",
    eyebrow: "Product Strategy / North America",
    summary:
      "2-week IA and UX design engagement for a B2B workflow automation SaaS. Delivered annotated user journey maps, 42 high-fidelity Figma screens, and a reusable component library.",
    industry: "SaaS",
    location: "North America",
    timeline: "2 weeks",
    stack: "Figma + UX research + Component library",
    status: "Completed",
    resultValue: "42",
    resultLabel: "High-fidelity screens",
    resultContext: "delivered across 2 weeks",
    tags: ["Figma", "UX research", "Component library", "B2B"],
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    services: ["product-strategy"],
    year: "2025",
  },

  {
    slug: "mobility-app-product-strategy",
    title: "Mobility App Product Strategy",
    eyebrow: "Product Strategy / East Africa",
    summary:
      "Product definition and scoping sprint for a shared-mobility startup. Defined rider and driver apps, pricing engine logic, and the full backend fleet management architecture.",
    industry: "Mobility",
    location: "East Africa",
    timeline: "2 weeks",
    stack: "Figma + System design + Technical spec",
    status: "Completed",
    resultValue: "8 days",
    resultLabel: "From brief to technical spec",
    resultContext: "investor-ready product document",
    tags: ["Figma", "System design", "Mobility", "Roadmapping"],
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    services: ["product-strategy"],
    year: "2025",
  },
];

/** Returns all projects list from localStorage or seed fallback. */
export function getProjectsList(): ProjectEntry[] {
  if (typeof window === "undefined") {
    return projects;
  }
  const stored = localStorage.getItem("andishi_projects");
  if (!stored) {
    localStorage.setItem("andishi_projects", JSON.stringify(projects));
    return projects;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return projects;
  }
}

/** Saves or updates a project entry. */
export function saveProjectEntry(project: ProjectEntry): void {
  if (typeof window === "undefined") return;
  const list = getProjectsList();
  const index = list.findIndex((p) => p.slug === project.slug);
  if (index >= 0) {
    list[index] = project;
  } else {
    list.unshift(project);
  }
  localStorage.setItem("andishi_projects", JSON.stringify(list));
  window.dispatchEvent(new Event("projects_updated"));
}

/** Deletes a project entry. */
export function deleteProjectEntry(slug: string): void {
  if (typeof window === "undefined") return;
  const list = getProjectsList().filter((p) => p.slug !== slug);
  localStorage.setItem("andishi_projects", JSON.stringify(list));
  window.dispatchEvent(new Event("projects_updated"));
}

/** Returns all projects for a given service slug, max `limit` items. */
export function getProjectsByService(slug: ServiceType, limit = 6): ProjectEntry[] {
  return getProjectsList()
    .filter((p) => p.services.includes(slug))
    .slice(0, limit);
}
