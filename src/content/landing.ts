import {
  IconCode,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconBrain,
  IconBuildingSkyscraper,
  IconCurrencyBitcoin,
  IconCpu,
  IconCloudComputing,
} from "@tabler/icons-react";

export const partners = ["M-Pesa", "Equity", "Twiga", "Bolt", "Jumia", "KCB", "Britam"];

export const services = [
  {
    title: "Web Applications",
    body: "Custom-built web apps for businesses that have outgrown spreadsheets and off-the-shelf tools.",
    timeline: "4–10 weeks",
    icon: IconDeviceDesktop,
    slug: "custom-software",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "SaaS Products",
    body: "From MVP to multi-tenant platform. We design the product architecture, build it, and ship it.",
    timeline: "6–14 weeks",
    icon: IconCode,
    slug: "saas-development",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Mobile Applications",
    body: "iOS and Android apps built for real usage patterns. Native or cross-platform.",
    timeline: "6–12 weeks",
    icon: IconDeviceMobile,
    slug: "mobile-apps",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "AI & Intelligent Systems",
    body: "LLM integrations, AI-powered features, and intelligent automation built into production software.",
    timeline: "3–8 weeks",
    icon: IconBrain,
    slug: "ai-systems",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Enterprise Software",
    body: "Internal platforms, workflow systems, and business tools that replace spreadsheets at scale.",
    timeline: "8–20 weeks",
    icon: IconBuildingSkyscraper,
    slug: "enterprise-software",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Blockchain & Web3",
    body: "Smart contracts, on-chain integrations, DeFi tooling, and token-gated product features.",
    timeline: "4–12 weeks",
    icon: IconCurrencyBitcoin,
    slug: "blockchain",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "APIs & Integrations",
    body: "Backend systems, data pipelines, and service integrations that connect your tools.",
    timeline: "2–6 weeks",
    icon: IconCpu,
    slug: "apis-integrations",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Product Strategy & Design",
    body: "Scope definition, information architecture, UX design, and technical advisory.",
    timeline: "1–3 weeks",
    icon: IconCloudComputing,
    slug: "product-strategy",
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Start with a direct chat",
    body: "Tell us about your product goals in your own words over WhatsApp. We prefer hearing details directly from you. Once aligned, we jump on a scoping call to formalize what's realistic.",
  },
  {
    step: "02",
    title: "We write the brief, not you",
    body: "Our product manager translates our chat and call into a comprehensive project brief: scope, timeline, deliverables, and direct cost. You approve or we adjust. No drawn-out specs documents.",
  },
  {
    step: "03",
    title: "We build in sprints, not silos",
    body: "You see working progress every week. Feedback rounds are structured. Scope changes are flagged the moment they appear - never buried in a final review.",
  },
  {
    step: "04",
    title: "You get a live product",
    body: "When we ship, the product is live, tested, and documented. You own the IP entirely. We stay available for 30 days post-launch.",
  },
];

export const caseStudies = [
  {
    industry: "Fintech",
    location: "Nairobi",
    timeline: "5 weeks",
    title: "Payment Reconciliation Engine",
    problem:
      "The client needed a reliable engine that unified M-Pesa, cards, callback handling, and finance reporting.",
    shipped:
      "A custom payment operations layer with retry queues, admin reconciliation, and live transaction visibility.",
    metric: "98.3%",
    context: "payments reconciled",
    quote: "The engine understood production risk from day one.",
  },
  {
    industry: "EdTech",
    location: "Kenya",
    timeline: "3 weeks",
    title: "School Operations Platform",
    problem:
      "School teams needed fee visibility, parent communication, staff workflows, and role-based access in one system.",
    shipped:
      "A multi-workspace school management platform with parent updates, fee tracking, and local payment patterns.",
    metric: "12+",
    context: "schools onboarded",
    quote: "They shipped like part of our own team.",
  },
  {
    industry: "SaaS",
    location: "Global-ready",
    timeline: "4 weeks",
    title: "Operations Analytics Dashboard",
    problem:
      "Operators had useful data, but it lived across disconnected tools and arrived too late for weekly decisions.",
    shipped:
      "An analytics layer with trend cards, API data pipeline feeds, and reporting views leaders could act on.",
    metric: "+41%",
    context: "faster decision cycle",
    quote: "The technical judgment was senior, practical, and fast.",
  },
];

export const showcaseProjects = [
  {
    eyebrow: "Fintech / Nairobi",
    title: "Payment Reconciliation Engine",
    accent: "with production reconciliation depth",
    summary:
      "A custom backend payment operations layer that unified M-Pesa, cards, callback handling, and financial reporting for a growing B2B commerce startup.",
    industry: "Fintech",
    location: "Nairobi",
    timeline: "5 weeks",
    stack: "Next.js + Node + PostgreSQL",
    status: "Completed",
    resultLabel: "Match rate",
    resultValue: "98.3%",
    resultContext: "payments reconciled",
    statLabel: "Payment match rate",
    statValue: "98.3%",
    statSub: "M-Pesa records reconciled",
    tags: ["M-Pesa", "Inventory", "Orders", "Analytics", "PostgreSQL"],
    image: "/images/project1.webp",
  },
  {
    eyebrow: "EdTech / Kenya",
    title: "School Operations Platform",
    accent: "for local institutions",
    summary:
      "A multi-workspace administration platform featuring parent updates, invoice tracking, role-based access, and direct M-Pesa integration.",
    industry: "EdTech",
    location: "Kenya",
    timeline: "3 weeks",
    stack: "Next.js + MongoDB",
    status: "Completed",
    resultLabel: "Schools",
    resultValue: "12+",
    resultContext: "institutions onboarded",
    statLabel: "Support window",
    statValue: "30d",
    statSub: "post-launch support",
    tags: ["RBAC", "Parent portal", "M-Pesa", "Reporting", "MongoDB"],
    image: "/images/project4.webp",
  },
  {
    eyebrow: "SaaS / Analytics",
    title: "Operations Analytics Dashboard",
    accent: "for cross-tool insights",
    summary:
      "An analytics dashboard and pipeline that connects various operational data feeds into real-time reporting metrics and API feeds.",
    industry: "SaaS",
    location: "Global-ready",
    timeline: "4 weeks",
    stack: "React + API + PostgreSQL",
    status: "Completed",
    resultLabel: "Decision cycle",
    resultValue: "41%",
    resultContext: "faster decisions",
    statLabel: "Cycle time improved",
    statValue: "41%",
    statSub: "across reporting workflows",
    tags: ["Dashboards", "Data pipeline", "Reporting", "API", "Charts"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Logistics / East Africa",
    title: "Fleet Management Engine",
    accent: "for cross-border routing",
    summary:
      "A real-time logistics engine with intelligent route optimization, driver app communication, and automated border compliance checks.",
    industry: "Logistics",
    location: "East Africa",
    timeline: "6 weeks",
    stack: "React Native + Node + Redis",
    status: "Completed",
    resultLabel: "Active Fleet",
    resultValue: "450+",
    resultContext: "vehicles managed daily",
    statLabel: "Route efficiency",
    statValue: "18%",
    statSub: "reduction in idle time",
    tags: ["Geolocation", "Redis", "React Native", "Routing"],
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Healthcare / Connect",
    title: "Patient Operations Portal",
    accent: "with secure tele-health integration",
    summary:
      "A HIPAA-compliant patient portal that connects doctors, lab results, and pharmacy prescriptions in a single seamless interface.",
    industry: "Healthcare",
    location: "Global",
    timeline: "8 weeks",
    stack: "Next.js + Postgres + WebRTC",
    status: "Completed",
    resultLabel: "Consultations",
    resultValue: "10k+",
    resultContext: "monthly active sessions",
    statLabel: "Uptime guarantee",
    statValue: "99.99%",
    statSub: "infrastructure reliability",
    tags: ["WebRTC", "HIPAA", "Video Calls", "Booking"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "E-Commerce / B2B",
    title: "Wholesale Ordering Platform",
    accent: "built for high-volume inventory",
    summary:
      "A comprehensive B2B storefront integrating deeply with legacy ERP systems to handle tiered pricing, bulk ordering, and credit limits.",
    industry: "Retail",
    location: "Kenya",
    timeline: "5 weeks",
    stack: "Vue.js + Python + GraphQL",
    status: "Completed",
    resultLabel: "GMV Processed",
    resultValue: "$2.4M",
    resultContext: "in the first quarter",
    statLabel: "Order velocity",
    statValue: "3x",
    statSub: "faster processing time",
    tags: ["GraphQL", "ERP", "Vue.js", "B2B Commerce"],
    image:
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "AI Tooling / Internal",
    title: "Legal Document Analyzer",
    accent: "powered by custom LLMs",
    summary:
      "An internal tool for legal teams that automatically extracts clauses, highlights risks, and generates summaries from massive contract datasets.",
    industry: "LegalTech",
    location: "UK",
    timeline: "4 weeks",
    stack: "React + FastAPI + OpenAI",
    status: "Completed",
    resultLabel: "Time Saved",
    resultValue: "85%",
    resultContext: "per document review",
    statLabel: "Accuracy rate",
    statValue: "99.1%",
    statSub: "on clause detection",
    tags: ["LLM", "FastAPI", "Vector DB", "Document Parsing"],
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  },
];

export const comparisonRows = [
  ["Scoping speed", "Days to weeks", "Weeks to months", "One call"],
  ["Accountability", "One person", "Account manager layer", "Founder-direct"],
  ["Timeline transparency", "Variable", "Milestone-gated", "Weekly visible progress"],
  ["IP ownership", "Shared or unclear", "Contracted, but checked", "You own everything, always"],
  ["Talent depth", "One generalist", "Junior-heavy teams", "Senior engineers across 8 domains"],
  ["Post-launch support", "Rare", "Retainer-only", "30 days included"],
  ["Delivery start", "2–4 weeks", "4–8 weeks", "Within 5 business days"],
  ["Talent hire option", "No", "No", "Yes - same vetted team"],
];

export const faqItems = [
  {
    q: "What kinds of products do you build?",
    a: "Web applications, SaaS platforms, AI-powered tools, mobile apps (iOS and Android), enterprise internal tools, blockchain and Web3 products, APIs, and data integrations. If the product needs to be built and shipped, it's in scope.",
  },
  {
    q: "How long does a typical project take?",
    a: "A scoped web app takes 4–10 weeks. A full SaaS product is typically 6–14 weeks from scoping to initial launch. Mobile apps run 6–12 weeks. We give you a specific timeline in the brief after the first call.",
  },
  {
    q: "Do you also place engineers directly?",
    a: "Yes. If you'd rather extend your own team than hand off a project, we source and place senior engineers from our vetted network. Average time-to-placement is 8 days. There's a 30-day replacement guarantee.",
  },
  {
    q: "Who do you work with?",
    a: "Founders launching their first product, CTOs extending their engineering capacity, and established businesses replacing manual systems with purpose-built software. We work with clients in Nairobi, across East Africa, and internationally.",
  },
  {
    q: "What happens if something's not right after you ship?",
    a: "We stay available for 30 days post-launch at no additional cost. If the problem is inside the scope we defined, we fix it. If it's a scope change, we scope and price it separately.",
  },
  {
    q: "How do I get started?",
    a: "The /start-project form takes five minutes. We'll schedule a scoping call within one business day.",
  },
];
