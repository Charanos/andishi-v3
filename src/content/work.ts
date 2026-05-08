export type WorkProjectStatus = "Live" | "Shipped" | "Beta";

export type WorkProject = {
  id: string;
  sector: "fintech" | "edtech" | "logistics" | "retail" | "saas" | "services";
  sectorLabel: string;
  title: string;
  shortTitle: string;
  description: string;
  challenge: string;
  solution: string;
  image: string;
  status: WorkProjectStatus;
  metric: string;
  metricLabel: string;
  timeline: string;
  location: string;
  featured?: boolean;
  imageHeight: "short" | "mid" | "tall";
  tags: string[];
  metrics: Array<{
    label: string;
    tone?: "cyan" | "success" | "primary";
    value: string;
  }>;
};

export const workProjects: WorkProject[] = [
  {
    id: "lipa-commerce",
    sector: "fintech",
    sectorLabel: "Fintech / Payments",
    title: "Lipa Commerce Platform",
    shortTitle: "Lipa Commerce",
    description:
      "Unified payment and reconciliation infrastructure for an East African B2B commerce team moving across M-Pesa, cards, and internal reporting.",
    challenge:
      "The team was reconciling payments across separate provider dashboards, spreadsheets, and manual finance checks. Failed transactions were hard to trace, and leadership had no live view of payment health.",
    solution:
      "We designed a single payment operations layer with webhook handling, retry logic, admin reconciliation, and a live dashboard that made M-Pesa-first commerce measurable.",
    image: "/images/project1.webp",
    status: "Live",
    metric: "98.3%",
    metricLabel: "payment match rate",
    timeline: "5 weeks",
    location: "Nairobi",
    featured: true,
    imageHeight: "mid",
    tags: ["M-Pesa", "Next.js", "Node.js", "PostgreSQL"],
    metrics: [
      { value: "98.3%", label: "match rate", tone: "success" },
      { value: "5w", label: "engineer-led build", tone: "cyan" },
      { value: "3", label: "payment rails" },
      { value: "24/7", label: "ops visibility", tone: "primary" },
    ],
  },
  {
    id: "myschool-platform",
    sector: "edtech",
    sectorLabel: "EdTech / SaaS",
    title: "MySchool Platform",
    shortTitle: "MySchool",
    description:
      "A school operations product for Kenyan institutions handling fee visibility, parent communication, class records, and staff workflows.",
    challenge:
      "School teams were split across notebooks, WhatsApp groups, and spreadsheets. Parents needed clearer fee visibility, and administrators needed cleaner reporting without adding more manual work.",
    solution:
      "We built a multi-workspace platform with role-based access, fee tracking, parent-facing updates, and school-ready reporting patterns for the local operating context.",
    image: "/images/project2.webp",
    status: "Live",
    metric: "12+",
    metricLabel: "schools onboarded",
    timeline: "18 days",
    location: "Kenya",
    imageHeight: "tall",
    tags: ["Multi-tenant", "Next.js", "MongoDB", "M-Pesa"],
    metrics: [
      { value: "12+", label: "schools", tone: "cyan" },
      { value: "18d", label: "engineer-led build" },
      { value: "4", label: "user roles" },
      { value: "30d", label: "support", tone: "success" },
    ],
  },
  {
    id: "haraka-fleet",
    sector: "logistics",
    sectorLabel: "Logistics / Ops",
    title: "Haraka Fleet Dashboard",
    shortTitle: "Haraka Fleet",
    description:
      "Real-time dispatch and route visibility for a delivery operation coordinating vehicles, city zones, and customer status updates.",
    challenge:
      "Dispatchers were depending on calls and chat updates to know where vehicles were. Route planning and exception handling were reactive, which slowed down customer communication.",
    solution:
      "We created a live operations dashboard with vehicle status, route summaries, dispatch views, and alert surfaces built for repeated daily use.",
    image: "/images/project3.webp",
    status: "Live",
    metric: "240+",
    metricLabel: "vehicles tracked",
    timeline: "7 weeks",
    location: "East Africa",
    imageHeight: "mid",
    tags: ["Realtime", "Maps", "Redis", "Dashboards"],
    metrics: [
      { value: "240+", label: "vehicles", tone: "cyan" },
      { value: "3", label: "cities" },
      { value: "99.1%", label: "uptime", tone: "success" },
      { value: "7w", label: "engineer-led build" },
    ],
  },
  {
    id: "duka-online",
    sector: "retail",
    sectorLabel: "Retail / E-Commerce",
    title: "Duka Online Store",
    shortTitle: "Duka Online",
    description:
      "Mobile-first commerce for a retail brand that needed cleaner product browsing, M-Pesa checkout, and inventory visibility.",
    challenge:
      "Sales were happening through social DMs and manual payment confirmation. The brand could not reliably track inventory, campaign performance, or order status.",
    solution:
      "We shipped a conversion-focused storefront, payment flow, order dashboard, and lightweight stock management system that matched how the team already sold online.",
    image: "/images/project4.webp",
    status: "Shipped",
    metric: "+62%",
    metricLabel: "conversion lift",
    timeline: "14 days",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["Commerce", "M-Pesa", "Inventory", "Analytics"],
    metrics: [
      { value: "+62%", label: "conversion", tone: "success" },
      { value: "14d", label: "engineer-led build", tone: "cyan" },
      { value: "2", label: "sales channels" },
      { value: "1", label: "admin view" },
    ],
  },
  {
    id: "ripoti-analytics",
    sector: "saas",
    sectorLabel: "SaaS / Analytics",
    title: "Ripoti Analytics Suite",
    shortTitle: "Ripoti",
    description:
      "A business intelligence layer for SME teams that needed plain-language reporting across sales, stock, and customer activity.",
    challenge:
      "Operators had data, but it lived in disconnected systems. Useful answers took hours to prepare and were usually too late to affect the week.",
    solution:
      "We built a dashboard that turns operational data into visual summaries, trend cards, and decisions a founder can act on without a data team.",
    image: "/images/project5.webp",
    status: "Live",
    metric: "340+",
    metricLabel: "active SME accounts",
    timeline: "21 days",
    location: "Kenya",
    imageHeight: "tall",
    tags: ["Analytics", "Charts", "Reporting", "API"],
    metrics: [
      { value: "340+", label: "accounts", tone: "cyan" },
      { value: "21d", label: "engineer-led build" },
      { value: "8", label: "dashboards" },
      { value: "+41%", label: "decision speed", tone: "success" },
    ],
  },
  {
    id: "chapaa-wallet",
    sector: "fintech",
    sectorLabel: "Fintech / Wallets",
    title: "Chapaa Digital Wallet",
    shortTitle: "Chapaa",
    description:
      "A beta wallet concept pairing simplified onboarding with mobile money interoperability and a cleaner consumer finance experience.",
    challenge:
      "The product needed to feel trustworthy and simple while handling technical rails that most users should never have to think about.",
    solution:
      "We prototyped the wallet experience, onboarding, transaction surfaces, and admin tools with a clear path from beta learning to production hardening.",
    image: "/images/project6.webp",
    status: "Beta",
    metric: "800",
    metricLabel: "closed beta users",
    timeline: "4 weeks",
    location: "Kenya",
    imageHeight: "mid",
    tags: ["Wallet", "Mobile money", "KYC", "Prototype"],
    metrics: [
      { value: "800", label: "beta users", tone: "cyan" },
      { value: "4w", label: "prototype" },
      { value: "<30s", label: "key flow", tone: "success" },
      { value: "Beta", label: "stage" },
    ],
  },
  {
    id: "soma-tutor",
    sector: "edtech",
    sectorLabel: "EdTech / Marketplace",
    title: "Soma Tutor Marketplace",
    shortTitle: "Soma Tutor",
    description:
      "A two-sided education marketplace helping parents discover tutors, book sessions, and manage payments from one place.",
    challenge:
      "Parents were finding tutors through informal referrals, with no clear vetting, session history, or protected booking flow.",
    solution:
      "We built tutor profiles, discovery filters, booking workflows, payment states, and admin moderation for a marketplace ready to learn from real usage.",
    image: "/images/project7.webp",
    status: "Live",
    metric: "1.2k+",
    metricLabel: "sessions booked",
    timeline: "16 days",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["Marketplace", "Bookings", "Profiles", "Payments"],
    metrics: [
      { value: "1.2k+", label: "sessions", tone: "cyan" },
      { value: "180+", label: "tutors" },
      { value: "4.8", label: "avg rating", tone: "success" },
      { value: "16d", label: "engineer-led build" },
    ],
  },
  {
    id: "biashara-crm",
    sector: "saas",
    sectorLabel: "SaaS / CRM",
    title: "Biashara CRM",
    shortTitle: "Biashara",
    description:
      "A lightweight sales workspace for East African teams managing leads, follow-ups, WhatsApp conversations, and payment visibility.",
    challenge:
      "The team was losing deal context between WhatsApp, notes, and payment confirmations. Leaders could not forecast or spot stuck opportunities early enough.",
    solution:
      "We created a pipeline workspace with contact history, follow-up states, payment notes, and weekly reporting that brought sales work into one view.",
    image: "/images/project8.webp",
    status: "Live",
    metric: "+91%",
    metricLabel: "pipeline visibility",
    timeline: "19 days",
    location: "East Africa",
    imageHeight: "mid",
    tags: ["CRM", "WhatsApp", "Pipeline", "Reporting"],
    metrics: [
      { value: "+91%", label: "visibility", tone: "success" },
      { value: "50+", label: "teams" },
      { value: "19d", label: "engineer-led build", tone: "cyan" },
      { value: "Weekly", label: "reports" },
    ],
  },
];

export const workFilters = [
  { label: "All projects", value: "all" },
  { label: "Fintech", value: "fintech" },
  { label: "EdTech", value: "edtech" },
  { label: "Logistics", value: "logistics" },
  { label: "Retail", value: "retail" },
  { label: "SaaS", value: "saas" },
] as const;
