import type { CaseStudyProject } from "@/types/case-study";

export type WorkProjectStatus = "Live" | "Shipped" | "Beta";

export type WorkProject = {
  id: string;
  sector: string;
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
  {
    id: "boma-proptech",
    sector: "saas",
    sectorLabel: "SaaS / PropTech",
    title: "Boma Property Manager",
    shortTitle: "Boma PropTech",
    description:
      "A complete property management and utility reconciliation platform built for residential developers overseeing hundreds of multi-family units.",
    challenge:
      "Tenants and landlords were manually managing water utility calculations, rent collection, and repairs via paper booklets and manual bank checks.",
    solution:
      "We delivered a landlord portal and tenant mobile dashboard automating billing cycles, handling M-Pesa direct rent deposits, and tracking maintenance work.",
    image: "/images/project1.webp",
    status: "Live",
    metric: "+150k",
    metricLabel: "monthly rent collected",
    timeline: "6 weeks",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["SaaS", "Billing", "M-Pesa", "Next.js"],
    metrics: [
      { value: "+150k", label: "rent/mo", tone: "success" },
      { value: "6w", label: "build duration", tone: "cyan" },
      { value: "480", label: "tenants" },
      { value: "98.9%", label: "collection rate", tone: "primary" },
    ],
  },
  {
    id: "kilimo-logistics",
    sector: "logistics",
    sectorLabel: "Logistics / Agriculture",
    title: "Kilimo Agri Supply Chain",
    shortTitle: "Kilimo Chain",
    description:
      "Real-time crop tracking, price registry, and dispatcher app coordinating hundreds of independent farmers with central regional distributors.",
    challenge:
      "Farmers were losing up to 40% of their harvest due to delayed pickup times, opaque central pricing, and lack of trucking dispatch visibility.",
    solution:
      "We built an offline-friendly crop registry and SMS dispatch manager linking driver location directly with local farmer cooperatives.",
    image: "/images/project2.webp",
    status: "Live",
    metric: "91%",
    metricLabel: "reduction in crop waste",
    timeline: "2 months",
    location: "Mombasa",
    imageHeight: "mid",
    tags: ["Logistics", "IoT", "SMS", "PostgreSQL"],
    metrics: [
      { value: "91%", label: "waste reduced", tone: "success" },
      { value: "2m", label: "agile build", tone: "cyan" },
      { value: "1.2k", label: "farmers active" },
      { value: "12m", label: "metric tons shipped" },
    ],
  },
  {
    id: "afya-health",
    sector: "saas",
    sectorLabel: "SaaS / HealthTech",
    title: "Afya Telehealth Clinic",
    shortTitle: "Afya Health",
    description:
      "HIPAA-compliant telemedicine workspace allowing remote patient triage, video consultation, and instant pharmacy prescription routing.",
    challenge:
      "Regional patients in remote areas spent hours traveling to city clinics for simple follow-up consultations and prescription refills.",
    solution:
      "We designed an integrated virtual clinic with live WebRTC video calling, structured doctor consultation notes, and secure digital prescription outputs.",
    image: "/images/project3.webp",
    status: "Beta",
    metric: "4.9/5",
    metricLabel: "patient rating",
    timeline: "3 months",
    location: "Eldoret",
    imageHeight: "tall",
    tags: ["WebRTC", "Next.js", "HIPAA", "Healthcare"],
    metrics: [
      { value: "4.9", label: "patient rating", tone: "success" },
      { value: "3m", label: "product sprint", tone: "cyan" },
      { value: "34", label: "clinical doctors" },
      { value: "85%", label: "visit efficiency" },
    ],
  },
  {
    id: "nenda-fleet",
    sector: "logistics",
    sectorLabel: "Logistics / Transport",
    title: "Nenda Dispatch App",
    shortTitle: "Nenda Fleet",
    description:
      "A custom internal transport coordinate system enabling corporate vehicle scheduling, automatic rider matching, and route telemetry logging.",
    challenge:
      "A major multinational team in Nairobi was losing track of fuel card allocations and dispatch times for their corporate transport vehicles.",
    solution:
      "We shipped custom passenger and driver applications alongside a centralized fleet dashboard showing live fuel usage and dispatcher logs.",
    image: "/images/project4.webp",
    status: "Live",
    metric: "-22%",
    metricLabel: "fuel cost reduction",
    timeline: "7 weeks",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["Mobile", "GPS", "Fleet Manager", "Node.js"],
    metrics: [
      { value: "-22%", label: "fuel cost", tone: "success" },
      { value: "7w", label: "engineering", tone: "cyan" },
      { value: "140", label: "fleet cars" },
      { value: "20s", label: "average match time", tone: "primary" },
    ],
  },
  {
    id: "zawadi-loyalty",
    sector: "retail",
    sectorLabel: "Retail / Payments",
    title: "Zawadi Rewards API",
    shortTitle: "Zawadi API",
    description:
      "A developer-first loyalty point ledger API enabling instant retail cashbacks, points conversion, and multi-merchant rewards sharing.",
    challenge:
      "Local supermarkets and retail chains wanted to collaborate on client loyalty programs but lacked a secure, synchronized ledger engine.",
    solution:
      "We built a robust, highly optimized API ledger handling high-concurrency transactions with webhooks and direct dashboard managers.",
    image: "/images/project5.webp",
    status: "Live",
    metric: "2.4m+",
    metricLabel: "daily API requests",
    timeline: "4 weeks",
    location: "Kigali",
    imageHeight: "mid",
    tags: ["API", "Redshift", "Express.js", "Redis"],
    metrics: [
      { value: "2.4m", label: "API calls", tone: "success" },
      { value: "4w", label: "delivery", tone: "cyan" },
      { value: "18", label: "retail brands" },
      { value: "99.99%", label: "uptime", tone: "primary" },
    ],
  },
  {
    id: "soko-pos",
    sector: "retail",
    sectorLabel: "Retail / E-Commerce",
    title: "Soko Store POS",
    shortTitle: "Soko POS",
    description:
      "Offline-first point-of-sale register application automatically syncing local sales databases with a cloud inventory manager.",
    challenge:
      "Retailers in regional markets with unstable internet connections experienced frequent transaction losses using cloud-only POS systems.",
    solution:
      "We built a progressive web application utilizing browser local databases, automatic offline cache queuing, and background cloud sync listeners.",
    image: "/images/project6.webp",
    status: "Shipped",
    metric: "100%",
    metricLabel: "offline transactional integrity",
    timeline: "24 days",
    location: "Kisumu",
    imageHeight: "tall",
    tags: ["PWA", "IndexedDB", "E-commerce", "SaaS"],
    metrics: [
      { value: "100%", label: "offline safety", tone: "success" },
      { value: "24d", label: "engineer build", tone: "cyan" },
      { value: "32", label: "stores active" },
      { value: "450k+", label: "transactions synced" },
    ],
  },
  {
    id: "siri-chatbot",
    sector: "saas",
    sectorLabel: "SaaS / AI Systems",
    title: "Siri AI Support Assistant",
    shortTitle: "Siri AI",
    description:
      "LLM powered customer support agent capable of parsing localized languages (Swahili, Sheng, English) to resolve customer account queries.",
    challenge:
      "A fast-growing SME was overwhelmed by simple account queries, resulting in 4-hour customer service wait times.",
    solution:
      "We built an intelligent Retrieval-Augmented Generation agent integrated with their customer base, resolving questions in under 10 seconds.",
    image: "/images/project7.webp",
    status: "Beta",
    metric: "84%",
    metricLabel: "queries resolved",
    timeline: "3 weeks",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["LLM", "RAG", "Swahili NLP", "OpenAI"],
    metrics: [
      { value: "84%", label: "resolution rate", tone: "success" },
      { value: "3w", label: "AI prototype", tone: "cyan" },
      { value: "10s", label: "average response" },
      { value: "98%", label: "cost saved", tone: "primary" },
    ],
  },
  {
    id: "tokeni-blockchain",
    sector: "fintech",
    sectorLabel: "Fintech / Blockchain",
    title: "Tokeni Supply Ledger",
    shortTitle: "Tokeni Ledger",
    description:
      "Decentralized coffee supply chain ledger verifying organic farmer origin, crop grade tracking, and automated trade payout compliance.",
    challenge:
      "Coffee growers were struggling to get fair trade premiums due to opaque distributor layers and difficult origin verification protocols.",
    solution:
      "We delivered a smart contract system tracking bags of coffee from origin fields to distributor ports with public cryptographic logs.",
    image: "/images/project8.webp",
    status: "Live",
    metric: "4.8k+",
    metricLabel: "farmer wallets active",
    timeline: "8 weeks",
    location: "Kigali",
    imageHeight: "mid",
    tags: ["Ethereum", "Solidity", "Web3 API", "Next.js"],
    metrics: [
      { value: "4.8k", label: "farmer wallets", tone: "success" },
      { value: "8w", label: "smart contracts", tone: "cyan" },
      { value: "+30%", label: "earnings", tone: "primary" },
      { value: "Live", label: "stage" },
    ],
  },
  {
    id: "shule-fees",
    sector: "edtech",
    sectorLabel: "EdTech / Payments",
    title: "Shule Fees Manager",
    shortTitle: "Shule Fees",
    description:
      "An automated school fee collection, payment installment scheduler, and instant parent SMS reminder portal with M-Pesa direct clearing.",
    challenge:
      "School administrative staff spent several days a month reconciling cash, bank slips, and mobile money records during back-to-school periods.",
    solution:
      "We delivered an automated billing integration that reconciles every inbound M-Pesa receipt with parent profiles and updates balances instantly.",
    image: "/images/project1.webp",
    status: "Live",
    metric: "99.8%",
    metricLabel: "reconciliation accuracy",
    timeline: "20 days",
    location: "Nakuru",
    imageHeight: "tall",
    tags: ["Edtech", "Payments", "Next.js", "Tailwind"],
    metrics: [
      { value: "99.8%", label: "accuracy", tone: "success" },
      { value: "20d", label: "build duration", tone: "cyan" },
      { value: "1.8k", label: "students active" },
      { value: "Live", label: "deployment" },
    ],
  },
  {
    id: "leta-dispatch",
    sector: "logistics",
    sectorLabel: "Logistics / Mobile",
    title: "Leta Rider Dispatch Portal",
    shortTitle: "Leta Dispatch",
    description:
      "On-demand hyper-local messenger app with custom route optimization models tailored for dense motorcycle courier operations.",
    challenge:
      "Logistics coordinators were assigning messenger routes manually, leading to route overlap, fuel waste, and delayed deliveries.",
    solution:
      "We engineered a route optimization engine coordinating rider status, pickup location, and dropoff routes to pack delivery runs efficiently.",
    image: "/images/project2.webp",
    status: "Live",
    metric: "-35%",
    metricLabel: "delivery duration",
    timeline: "6 weeks",
    location: "Nairobi",
    imageHeight: "mid",
    tags: ["Maps API", "Node.js", "Redis", "Android"],
    metrics: [
      { value: "-35%", label: "trip time", tone: "success" },
      { value: "6w", label: "product sprint", tone: "cyan" },
      { value: "180+", label: "active riders" },
      { value: "99.2%", label: "on-time rate", tone: "primary" },
    ],
  },
  {
    id: "vuna-agritech",
    sector: "saas",
    sectorLabel: "SaaS / AI Systems",
    title: "Vuna Crop-Yield Platform",
    shortTitle: "Vuna Yield",
    description:
      "AI crop yield predictive analytics model processing soil sensor data, weather records, and historical harvests to advise large commercial growers.",
    challenge:
      "Farming groups had access to IoT sensors but lacked a unified dashboard translating sensor readings into proactive watering and crop harvesting schedules.",
    solution:
      "We designed a localized analytics platform showing soil moisture warnings, regional weather alerts, and predictive crop harvesting maps.",
    image: "/images/project3.webp",
    status: "Beta",
    metric: "+28%",
    metricLabel: "crop yield improvement",
    timeline: "2 months",
    location: "Nanyuki",
    imageHeight: "short",
    tags: ["TensorFlow", "IoT Hub", "SaaS", "Dashboard"],
    metrics: [
      { value: "+28%", label: "yield increase", tone: "success" },
      { value: "2m", label: "AI development", tone: "cyan" },
      { value: "850", label: "sensors active" },
      { value: "Beta", label: "stage" },
    ],
  },
  {
    id: "etiqa-insurance",
    sector: "fintech",
    sectorLabel: "Fintech / Payments",
    title: "Etiqa Micro-Insurance API",
    shortTitle: "Etiqa API",
    description:
      "Automated underwriting, premium invoicing, and digital claim disbursement API for smallholder agricultural insurance products.",
    challenge:
      "Traditional farm insurance policies were too expensive and manual to process for smallholder farmers with crop areas under 2 acres.",
    solution:
      "We engineered a micro-payment insurance engine calculating premium pricing and paying out claims instantly via M-Pesa based on weather satellite triggers.",
    image: "/images/project4.webp",
    status: "Live",
    metric: "12s",
    metricLabel: "claim disbursement time",
    timeline: "5 weeks",
    location: "Kampala",
    imageHeight: "mid",
    tags: ["API", "Serverless", "Payments", "AWS"],
    metrics: [
      { value: "12s", label: "payout time", tone: "success" },
      { value: "5w", label: "development", tone: "cyan" },
      { value: "12.5k", label: "policies active" },
      { value: "99.98%", label: "API uptime", tone: "primary" },
    ],
  },
  {
    id: "chama-saver",
    sector: "fintech",
    sectorLabel: "Fintech / Mobile",
    title: "Chama Cooperative App",
    shortTitle: "Chama Saver",
    description:
      "Collaborative saving, automated credit scoring, and peer lending application for self-managed community investment circles.",
    challenge:
      "Chamas (informal group savings circles) suffered from paper record errors, lack of payment receipts, and complex member credit calculations.",
    solution:
      "We shipped a shared mobile app ledger showing member savings balances, automated payment schedules, and member loan disbursement structures.",
    image: "/images/project5.webp",
    status: "Live",
    metric: "15k+",
    metricLabel: "active chama groups",
    timeline: "9 weeks",
    location: "Nairobi",
    imageHeight: "tall",
    tags: ["React Native", "Express", "Node", "Postgres"],
    metrics: [
      { value: "15k", label: "chama groups", tone: "success" },
      { value: "9w", label: "development", tone: "cyan" },
      { value: "$2.1m", label: "savings volume" },
      { value: "0.2%", label: "default rate", tone: "primary" },
    ],
  },
  {
    id: "pata-proptech",
    sector: "saas",
    sectorLabel: "SaaS / PropTech",
    title: "Pata Listing & Valuation API",
    shortTitle: "Pata API",
    description:
      "Aggregated real estate marketplace database, landlord CRM integrations, and instant listing price appraisal API.",
    challenge:
      "Property buyers faced fragmented real estate listings with frequent duplicate entries and outdated, manually determined valuation figures.",
    solution:
      "We compiled a standardized property data store and engineered automated price estimation models based on localized sale records.",
    image: "/images/project6.webp",
    status: "Live",
    metric: "+48%",
    metricLabel: "valuation calculation speed",
    timeline: "4 weeks",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["API", "Data Pipeline", "Python", "Node"],
    metrics: [
      { value: "+48%", label: "speed gain", tone: "success" },
      { value: "4w", label: "build duration", tone: "cyan" },
      { value: "11k", label: "properties mapped" },
      { value: "Live", label: "stage" },
    ],
  },
  {
    id: "elimu-lms",
    sector: "edtech",
    sectorLabel: "EdTech / SaaS",
    title: "Elimu White-Label LMS",
    shortTitle: "Elimu LMS",
    description:
      "Multi-tenant white-label learning portal enabling vocational schools to upload video modules, manage students, and evaluate exams offline.",
    challenge:
      "Vocational training programs in East Africa struggled to keep students engaged during remote learning cycles due to high bandwidth costs.",
    solution:
      "We built a highly compressed offline-friendly LMS portal allowing video downloading, local exam caching, and SMS module grading interfaces.",
    image: "/images/project7.webp",
    status: "Live",
    metric: "45k+",
    metricLabel: "students graduated",
    timeline: "2 months",
    location: "Dar es Salaam",
    imageHeight: "mid",
    tags: ["LMS", "Offline Video", "SaaS", "Next.js"],
    metrics: [
      { value: "45k", label: "graduates", tone: "success" },
      { value: "2m", label: "build sprint", tone: "cyan" },
      { value: "98", label: "colleges hosted" },
      { value: "-70%", label: "bandwidth usage", tone: "primary" },
    ],
  },
  {
    id: "kazi-marketplace",
    sector: "saas",
    sectorLabel: "SaaS / Operations",
    title: "Kazi Shift Dispatcher",
    shortTitle: "Kazi Portal",
    description:
      "Gig-worker registration, worker shift booking, automated identity validation, and micro-payroll processing portal built for industrial warehouses.",
    challenge:
      "Large regional cargo hubs suffered from high shift absenteeism, worker validation errors, and complex daily manual cash payouts.",
    solution:
      "We built an on-demand worker portal utilizing automated ID verification, shift booking, and instant automated bank/M-Pesa daily payouts.",
    image: "/images/project8.webp",
    status: "Live",
    metric: "98.2%",
    metricLabel: "shift attendance rate",
    timeline: "25 days",
    location: "Mombasa",
    imageHeight: "tall",
    tags: ["SaaS", "Payroll API", "KYC", "PostgreSQL"],
    metrics: [
      { value: "98.2%", label: "attendance", tone: "success" },
      { value: "25d", label: "engineer build", tone: "cyan" },
      { value: "3.2k", label: "contractors" },
      { value: "Live", label: "deployment" },
    ],
  },
  {
    id: "fahamu-chatbot",
    sector: "saas",
    sectorLabel: "SaaS / AI Systems",
    title: "Fahamu Account Assistant",
    shortTitle: "Fahamu Bot",
    description:
      "Swahili RAG automated messaging agent resolving client utility account questions and balance requests on WhatsApp.",
    challenge:
      "A regional utilities operator struggled with answering customer queries quickly during grid outages, overwhelming customer lines.",
    solution:
      "We integrated a custom GPT agent with Swahili customer database lookups, providing billing details and service warnings instantly.",
    image: "/images/project1.webp",
    status: "Live",
    metric: "+78%",
    metricLabel: "call center relief",
    timeline: "4 weeks",
    location: "Dar es Salaam",
    imageHeight: "mid",
    tags: ["LLM", "Swahili NLP", "WhatsApp API", "Node"],
    metrics: [
      { value: "78%", label: "support load saved", tone: "success" },
      { value: "4w", label: "delivery", tone: "cyan" },
      { value: "420k+", label: "queries processed" },
      { value: "100%", label: "Swahili accuracy", tone: "primary" },
    ],
  },
  {
    id: "jaza-grid",
    sector: "logistics",
    sectorLabel: "Logistics / Energy",
    title: "Jaza Solar Grid Tracker",
    shortTitle: "Jaza Grid",
    description:
      "Industrial battery health logging, power load manager, and pay-as-you-go customer activation system built for smart microgrids.",
    challenge:
      "Solar operators in remote communities lacked clear battery health diagnostics, leading to unexpected grid power drops.",
    solution:
      "We set up automated IoT logging to compile solar health stats and linked it to customer accounts, blocking activation upon non-payment.",
    image: "/images/project2.webp",
    status: "Live",
    metric: "99.9%",
    metricLabel: "grid operational uptime",
    timeline: "7 weeks",
    location: "Nanyuki",
    imageHeight: "short",
    tags: ["IoT Hub", "Dashboards", "SaaS", "Next.js"],
    metrics: [
      { value: "99.9%", label: "uptime", tone: "success" },
      { value: "7w", label: "agile build", tone: "cyan" },
      { value: "45", label: "solar hubs active" },
      { value: "Live", label: "deployment" },
    ],
  },
  {
    id: "hisa-broker",
    sector: "fintech",
    sectorLabel: "Fintech / Payments",
    title: "Hisa Fractional Share API",
    shortTitle: "Hisa API",
    description:
      "A stock execution, clearing ledger, and user portfolio reporting API enabling retail brokers to offer international stock purchases.",
    challenge:
      "Fintech startups in East Africa wanted to allow users to buy international shares but faced complex regulatory compliance and API limits.",
    solution:
      "We built a robust transaction processing and validation layer checking account compliance and executing orders with liquidity engines.",
    image: "/images/project3.webp",
    status: "Live",
    metric: "450ms",
    metricLabel: "average transaction speed",
    timeline: "6 weeks",
    location: "Nairobi",
    imageHeight: "tall",
    tags: ["API Ledger", "Redis", "Security", "Express.js"],
    metrics: [
      { value: "450ms", label: "trade speed", tone: "success" },
      { value: "6w", label: "build duration", tone: "cyan" },
      { value: "4", label: "supported exchanges" },
      { value: "Live", label: "regulatory setup" },
    ],
  },
  {
    id: "mali-advisor",
    sector: "saas",
    sectorLabel: "SaaS / AI Systems",
    title: "Mali Financial Advisor",
    shortTitle: "Mali Advisor",
    description:
      "Machine learning automated financial planner offering tailored investment advice and checking client risk status based on spending metrics.",
    challenge:
      "Many mobile wallet users wanted sound advice on investing their cash but could not afford the fee structures of personal financial consultants.",
    solution:
      "We engineered a localized recommendation system assessing budget balances, savings histories, and recommending custom investments.",
    image: "/images/project4.webp",
    status: "Beta",
    metric: "+32%",
    metricLabel: "user savings rate",
    timeline: "8 weeks",
    location: "Nairobi",
    imageHeight: "short",
    tags: ["Machine Learning", "FastAPI", "Dashboard", "SaaS"],
    metrics: [
      { value: "+32%", label: "savings increase", tone: "success" },
      { value: "8w", label: "product sprint", tone: "cyan" },
      { value: "14k", label: "users registered" },
      { value: "Beta", label: "stage" },
    ],
  },
  {
    id: "nyumba-rent",
    sector: "fintech",
    sectorLabel: "Fintech / Payments",
    title: "Nyumba Automated Rent System",
    shortTitle: "Nyumba Rent",
    description:
      "A merchant payment portal automatically splitting inbound rents into tax, utility, and landlord bank allocations upon M-Pesa receipt.",
    challenge:
      "Real estate operations spent days separating inbound rents, paying out contractors, and processing utility invoices manually.",
    solution:
      "We shipped a custom payment clearing API that parses payments, triggers instant automated payouts, and logs digital receipts for taxes.",
    image: "/images/project5.webp",
    status: "Live",
    metric: "100%",
    metricLabel: "automated tax compliance",
    timeline: "5 weeks",
    location: "Nairobi",
    imageHeight: "mid",
    tags: ["Payments", "API Integration", "Next.js", "MySQL"],
    metrics: [
      { value: "100%", label: "tax automated", tone: "success" },
      { value: "5w", label: "engineer build", tone: "cyan" },
      { value: "140", label: "buildings hosted" },
      { value: "$1.8m", label: "cleared volume" },
    ],
  },
  {
    id: "nuru-grid",
    sector: "saas",
    sectorLabel: "SaaS / Operations",
    title: "Nuru Commercial Grid Manager",
    shortTitle: "Nuru Grid",
    description:
      "An industrial battery log, energy distribution tracker, and dashboard detailing commercial property power metrics.",
    challenge:
      "Off-grid real estate structures lacked visibility into grid battery reserves, leading to expensive building outages during high loads.",
    solution:
      "We delivered an IoT integration monitoring microgrid battery cells, compiling real-time charts, and highlighting load-shedding risks.",
    image: "/images/project6.webp",
    status: "Live",
    metric: "-18%",
    metricLabel: "peak load energy costs",
    timeline: "2 months",
    location: "Nanyuki",
    imageHeight: "tall",
    tags: ["IoT", "SaaS", "Dashboard", "PostgreSQL"],
    metrics: [
      { value: "-18%", label: "energy save", tone: "success" },
      { value: "2m", label: "product sprint", tone: "cyan" },
      { value: "12", label: "commercial sites" },
      { value: "99.98%", label: "system uptime", tone: "primary" },
    ],
  },
  {
    id: "beba-cargo",
    sector: "logistics",
    sectorLabel: "Logistics / Ops",
    title: "Beba Freight Matcher",
    shortTitle: "Beba Cargo",
    description:
      "A B2B freight marketplace automatically matching available long-haul cargo with registered trucking teams based on route coordinates.",
    challenge:
      "Industrial freight dispatchers spent hours coordinating trip schedules and empty backhauls via phone calls and spreadsheets.",
    solution:
      "We engineered a cargo marketplace linking cargo weight, route points, and vehicle payload to construct optimal routes.",
    image: "/images/project7.webp",
    status: "Live",
    metric: "+56%",
    metricLabel: "truck utilization rate",
    timeline: "3 months",
    location: "Mombasa",
    imageHeight: "short",
    tags: ["Logistics", "Optimization", "Next.js", "Express"],
    metrics: [
      { value: "+56%", label: "utilization", tone: "success" },
      { value: "3m", label: "development", tone: "cyan" },
      { value: "480", label: "registered drivers" },
      { value: "99.1%", label: "successful trips" },
    ],
  },
  {
    id: "chainflow-audit",
    sector: "blockchain",
    sectorLabel: "Blockchain / Web3",
    title: "Chainflow DeFi Workspace",
    shortTitle: "Chainflow Audit",
    description:
      "Smart contract vulnerability validation logs, decentralized protocol audits, and automated compliance alert dashboards.",
    challenge:
      "Development teams launching decentralized protocols lacked a centralized workspace monitoring contract updates and audit markers.",
    solution:
      "We built a smart dashboard running automated static analysis models on target codebases and flagging transaction security warnings.",
    image: "/images/project8.webp",
    status: "Live",
    metric: "0",
    metricLabel: "post-launch vulnerabilities",
    timeline: "5 weeks",
    location: "Remote",
    imageHeight: "mid",
    tags: ["Solidity", "Securify", "Rust", "Web3 API"],
    metrics: [
      { value: "0", label: "vulnerabilities", tone: "success" },
      { value: "5w", label: "delivery", tone: "cyan" },
      { value: "8", label: "audited clients" },
      { value: "Live", label: "stage" },
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
  { label: "Legal Tech", value: "legaltech" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Casedok — flagship case study (updated separately once DB project is created)
// ─────────────────────────────────────────────────────────────────────────────
// Note: this static entry is the fallback for /work/casedok before the DB row
// is created and published. Gallery images are served from /public/casedok/.

export const casedokProject: WorkProject = {
  id: "casedok",
  sector: "legaltech",
  sectorLabel: "HealthTech / Legal SaaS",
  title: "Casedok",
  shortTitle: "Casedok",
  description:
    "A HIPAA-compliant, dual-sided SaaS platform that bridges the gap between patient healthcare data and legal discovery — replacing 30-day wait times with one-click, automated record retrieval.",
  challenge:
    "Law firms and legal professionals spend weeks manually chasing down medical records, films, and itemized bills, while patients lack secure, centralized ownership of their health history.",
  solution:
    "Andishi engineered distinct, secure portals for both patients and legal teams, powered by automated HITECH right-of-access requests and an OCR processing pipeline — delivering complete, HIPAA-compliant medical discovery in a single click.",
  image: "/casedok/hero-section.png",
  status: "Live",
  metric: "1 Click",
  metricLabel: "replaces 30-day manual discovery",
  timeline: "16 weeks",
  location: "USA",
  featured: true,
  imageHeight: "mid",
  tags: ["Next.js", "TypeScript", "PostgreSQL", "HIPAA", "OCR", "HITECH", "RBAC"],
  metrics: [
    { value: "30→1", label: "days to one click", tone: "success" },
    { value: "2", label: "secure user portals", tone: "cyan" },
    { value: "4+", label: "health plan integrations", tone: "primary" },
    { value: "100%", label: "HIPAA compliant" },
  ],
};

/**
 * Rich CaseStudyProject for Casedok — used directly by /work/casedok
 * when no DB record exists, bypassing mapStaticProjectToCaseStudy.
 * Contains the full narrative, approach steps, solution highlights,
 * and results that the ad campaign and detail page require.
 */

export const casedokCaseStudy: CaseStudyProject = {
  // ── Identity ──────────────────────────────────────────────────
  id: "casedok",
  slug: "casedok",
  dbId: null,

  // ── Hero ──────────────────────────────────────────────────────
  title: "Casedok",
  tagline: "We Are Ending Static Medicine and Increasing Access to Justice.",
  sector: "legaltech",
  sectorLabel: "HealthTech / Legal SaaS",
  clientName: "Casedok",
  coverImageUrl: "/casedok/hero-section.png",
  liveUrl: null,
  repoUrl: null,
  status: "Live",

  // ── Quick Facts Bar ───────────────────────────────────────────
  role: "Lead Engineer — Full Platform Build",
  teamSize: "4 engineers",
  timeline: "16 weeks",
  stackTags: [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Drizzle ORM",
    "AWS S3",
    "HIPAA",
    "OCR Pipeline",
    "RBAC",
    "HITECH",
  ],

  // ── Summary ───────────────────────────────────────────────────
  summary:
    "A HIPAA-compliant, dual-sided SaaS platform that replaced 30-day manual medical discovery with one-click automated retrieval — purpose-built for patients and legal professionals.",

  // ── Problem Narrative ─────────────────────────────────────────
  challenge:
    "Law firms and legal professionals spend weeks manually chasing down medical records, films, and itemized bills, while patients lack secure, centralized ownership of their health history. The status quo is fragmented oral histories, 30-day HITECH wait windows, and discovery that costs firms thousands per case.",

  // ── Approach Steps (System Architecture & Technical Highlights) ─
  approachSteps: [
    {
      id: "arch-01",
      title: "Dual-Portal Logic & RBAC",
      description:
        "Distinct routing and Role-Based Access Control (RBAC) separating the Patient Workspace from the Legal Professional Workspace — each with its own data boundaries, permission scopes, and UI surface.",
      imageUrl: null,
      order: 1,
    },
    {
      id: "arch-02",
      title: "Automated HITECH Requests",
      description:
        "Programmatic generation and routing of HITECH right-of-access requests directly to healthcare providers — eliminating manual fax queues and the 30-day wait window that defines legacy medical discovery.",
      imageUrl: null,
      order: 2,
    },
    {
      id: "arch-03",
      title: "OCR Processing Pipeline",
      description:
        "Automatic text extraction and verification for user-uploaded ID and insurance cards during secure registration — ensuring clean identity data flows into downstream claims aggregation without human review.",
      imageUrl: null,
      order: 3,
    },
    {
      id: "arch-04",
      title: "HIPAA-Compliant Infrastructure",
      description:
        "Enterprise-grade security protocols featuring encrypted, time-limited access controls for record sharing and comprehensive, audit-ready access trails — built specifically for court submissions and compliance reviews.",
      imageUrl: null,
      order: 4,
    },
    {
      id: "arch-05",
      title: "Claims Aggregation Engine",
      description:
        "Systems to scan health cards and aggregate medical claims in a single, unified interface — currently serving Medicare, UHC, Aetna, and Florida Blue enrollees across multiple plan structures.",
      imageUrl: null,
      order: 5,
    },
  ],

  // ── Solution Highlights (Feature Breakdown) ───────────────────
  solutionHighlights: [
    {
      id: "feat-patient-01",
      title: "Secure Patient Registration",
      description:
        "Seamless patient onboarding via automated OCR processing of government ID and insurance cards — replacing manual form entry with verified, secure identity confirmation.",
      imageUrl: null,
      order: 1,
    },
    {
      id: "feat-patient-02",
      title: "Individual Library of Medicine",
      description:
        "Patients can retrieve their entire medical history in one click, replacing fragmented oral histories with a precision, centrally-owned health record — accessible anytime, on demand.",
      imageUrl: null,
      order: 2,
    },
    {
      id: "feat-patient-03",
      title: "Granular Legal Access Control",
      description:
        "Patients control exactly who sees their data — send data blockers to authorities or share records exclusively with their legal team when needed, with full audit visibility.",
      imageUrl: null,
      order: 3,
    },
    {
      id: "feat-legal-01",
      title: "Firm Registration & Team Management",
      description:
        "Law firms can onboard attorneys, paralegals, and client accounts with strict role-based permissions — maintaining clean separation between case teams and client data visibility.",
      imageUrl: null,
      order: 4,
    },
    {
      id: "feat-legal-02",
      title: "Accelerated Medical Discovery",
      description:
        "Fetch complete medical evidence instantly, cap record retrieval expenses, and replace 30-day HITECH wait windows with immediate, automated access to full medical histories.",
      imageUrl: null,
      order: 5,
    },
    {
      id: "feat-legal-03",
      title: "Automated Case Summaries",
      description:
        "System-generated case summaries derived directly from patient records — delivered to legal teams to accelerate case preparation without manual document review.",
      imageUrl: null,
      order: 6,
    },
    {
      id: "feat-legal-04",
      title: "Secure Client Collaboration",
      description:
        "Invite clients via secure links, view and download complete medical histories, and maintain audit-ready records for court compliance — all within a single HIPAA-compliant workspace.",
      imageUrl: null,
      order: 7,
    },
  ],

  // ── Gallery ───────────────────────────────────────────────────
  gallery: [
    {
      id: "gallery-01",
      url: "/casedok/hero-section.png",
      alt: "Casedok platform hero — dual portal overview",
      width: 1280,
      height: 800,
      order: 1,
    },
    {
      id: "gallery-02",
      url: "/casedok/login.png",
      alt: "Casedok secure login — patient and legal professional portals",
      width: 1280,
      height: 800,
      order: 2,
    },
    {
      id: "gallery-03",
      url: "/casedok/how-and-why-casedok.png",
      alt: "How and why Casedok — platform overview and value proposition",
      width: 1280,
      height: 800,
      order: 3,
    },
    {
      id: "gallery-04",
      url: "/casedok/legal-sub-plans.png",
      alt: "Casedok legal subscription plans — tiered access for law firms",
      width: 1280,
      height: 800,
      order: 4,
    },
    {
      id: "gallery-05",
      url: "/casedok/pricing.png",
      alt: "Casedok pricing — transparent plan tiers for patients and legal professionals",
      width: 1280,
      height: 800,
      order: 5,
    },
  ],

  // ── Results & Impact ──────────────────────────────────────────
  results: [
    {
      id: "result-01",
      metric: "1 Click",
      label: "replaces 30-day manual discovery",
      context:
        "Manual 30-day HITECH wait times for complete medical histories replaced with automated, secure, one-click record retrieval.",
    },
    {
      id: "result-02",
      metric: "2",
      label: "secure user portals",
      context:
        "Distinct Patient Workspace and Legal Professional Workspace with independent RBAC boundaries.",
    },
    {
      id: "result-03",
      metric: "4+",
      label: "health plan integrations",
      context: "Claims aggregation serving Medicare, UHC, Aetna, and Florida Blue enrollees.",
    },
    {
      id: "result-04",
      metric: "100%",
      label: "HIPAA compliant infrastructure",
      context:
        "Enterprise-grade encrypted access, time-limited record sharing, and court-ready audit trails.",
    },
  ],

  testimonial: null,

  // ── Tech Stack ────────────────────────────────────────────────
  techStackDetails: [
    { name: "Next.js", reason: "Full-stack React framework for both portals" },
    { name: "TypeScript", reason: "End-to-end type safety across portal boundaries" },
    { name: "PostgreSQL", reason: "Relational schema for PHI with audit logging" },
    { name: "Drizzle ORM", reason: "Type-safe DB queries for HIPAA compliance" },
    { name: "AWS S3", reason: "Encrypted, access-controlled medical record storage" },
    { name: "OCR Pipeline", reason: "Automated ID & insurance card verification" },
    { name: "HITECH Automation", reason: "Programmatic right-of-access request routing" },
    { name: "RBAC", reason: "Role-based access control across both portals" },
  ],

  // ── SEO ───────────────────────────────────────────────────────
  seoMetaTitle: "Casedok — HIPAA-Compliant Medical Discovery SaaS | Andishi",
  seoMetaDescription:
    "Casedok replaces 30-day manual medical discovery with one-click retrieval. A HIPAA-compliant dual-sided SaaS platform built by Andishi for patients and legal professionals.",
  seoOgImageUrl: null,

  // ── Ad Campaign ───────────────────────────────────────────────
  adExcerpt:
    "30 days to 1 click. HIPAA-compliant dual-portal SaaS replacing manual medical discovery for patients and law firms.",
  featured: true,

  // ── Lifecycle ─────────────────────────────────────────────────
  caseStudyStatus: "published",
  publishedAt: "2025-01-01T00:00:00Z",
  updatedAt: null,
};

// Inject casedok at position 0 so it appears first on /work
if (!workProjects.find((p) => p.id === "casedok")) {
  workProjects.unshift(casedokProject);
}
