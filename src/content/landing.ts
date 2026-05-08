import {
  IconCircuitGroundDigital,
  IconDeviceDesktop,
  IconShoppingCart,
  IconWorldWww,
} from "@tabler/icons-react";

export const partners = ["M-Pesa", "Equity", "Twiga", "Bolt", "Jumia", "KCB", "Britam"];

export const heroStats = [
  ["48 hrs", "to first matched profiles"],
  ["8 days", "average time to placement"],
  ["30 days", "placement guarantee included"],
];

export const services = [
  {
    title: "Full-Stack Web Engineers",
    body: "Senior React, Next.js, Node.js, Python, and TypeScript engineers who can own features end-to-end.",
    timeline: "Contract / part-time / full placement",
    icon: IconDeviceDesktop,
  },
  {
    title: "AI & ML Integration Engineers",
    body: "Production-minded engineers for LLM features, RAG systems, fine-tuning pipelines, and AI product workflows.",
    timeline: "Contract / full placement",
    icon: IconShoppingCart,
  },
  {
    title: "Cloud & AWS Engineers",
    body: "Infrastructure engineers across EC2, Lambda, RDS, ECS, CloudFormation, deployment, and reliability work.",
    timeline: "Fractional / contract / full placement",
    icon: IconWorldWww,
  },
  {
    title: "Backend, Web3 & Mobile Engineers",
    body: "Vetted specialists for API systems, Solidity, Ethereum, React Native, Swift, Kotlin, and payment integrations.",
    timeline: "Contract / project-based / full placement",
    icon: IconCircuitGroundDigital,
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Tell us what you are building",
    body: "You talk to someone technical on our side. We learn your stack, team structure, bottleneck, and the kind of engineer who actually unblocks you.",
  },
  {
    step: "02",
    title: "We match within 48 hours",
    body: "We surface two to three vetted profiles from active talent instead of posting your role and waiting for applicants.",
  },
  {
    step: "03",
    title: "You interview, we facilitate",
    body: "A focused technical process: async assessment plus a 45-minute live session with your team. No six-round circus.",
  },
  {
    step: "04",
    title: "The engineer starts. We stay on.",
    body: "We handle onboarding logistics, check in at 30 and 90 days, and replace the engineer inside the guarantee window if needed.",
  },
];

export const caseStudies = [
  {
    industry: "Fintech",
    location: "East Africa",
    timeline: "5 weeks",
    title: "Senior backend engineer unified payment reconciliation",
    problem: "The client needed one engineer who could connect M-Pesa, cards, webhooks, and finance reporting without heavy oversight.",
    shipped: "A payment operations layer with retry logic, admin reconciliation, and live transaction visibility.",
    metric: "98.3%",
    context: "payment match rate",
    quote: "The engineer understood production risk from day one.",
  },
  {
    industry: "EdTech",
    location: "Kenya",
    timeline: "18 days",
    title: "Full-stack engineer shipped a school operations platform",
    problem: "School teams needed fee visibility, parent communication, staff workflows, and role-based access in one system.",
    shipped: "A multi-workspace platform with parent updates, reporting, and local payment patterns.",
    metric: "12+",
    context: "schools onboarded",
    quote: "They shipped like part of our own team.",
  },
  {
    industry: "SaaS",
    location: "Global-ready",
    timeline: "21 days",
    title: "Data engineer turned disconnected operations into dashboards",
    problem: "Operators had useful data, but it lived across disconnected tools and arrived too late for weekly decisions.",
    shipped: "An analytics layer with trend cards, API feeds, and reporting views leaders could act on.",
    metric: "+41%",
    context: "faster decision cycle",
    quote: "The technical judgment was senior, practical, and fast.",
  },
];

export const showcaseProjects = [
  {
    eyebrow: "Fintech / East Africa",
    title: "Payment systems engineer",
    accent: "with production reconciliation depth",
    summary:
      "A senior backend engineer unified M-Pesa, cards, callback handling, and finance reporting into one reliable operations layer for a B2B commerce team.",
    industry: "Fintech",
    location: "East Africa",
    timeline: "5 weeks",
    stack: "Next + Node + PostgreSQL",
    status: "Live",
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
    title: "Full-stack engineer",
    accent: "for school operations",
    summary:
      "A vetted full-stack engineer shipped role-based portals, fee visibility, parent updates, and reporting for Kenyan school teams.",
    industry: "EdTech",
    location: "Kenya",
    timeline: "18 days",
    stack: "Next.js + MongoDB",
    status: "Live",
    resultLabel: "Schools",
    resultValue: "12+",
    resultContext: "institutions onboarded",
    statLabel: "Support window",
    statValue: "30d",
    statSub: "post-launch check-ins",
    tags: ["RBAC", "Parent portal", "M-Pesa", "Reporting", "MongoDB"],
    image: "/images/project4.webp",
  },
  {
    eyebrow: "SaaS / Analytics",
    title: "Data product engineer",
    accent: "for operational clarity",
    summary:
      "An analytics engineer connected operational sources into dashboards, trend cards, and reporting APIs for teams that needed decisions faster.",
    industry: "SaaS",
    location: "Africa-sourced",
    timeline: "21 days",
    stack: "React + API + PostgreSQL",
    status: "Live",
    resultLabel: "Decision cycle",
    resultValue: "41%",
    resultContext: "faster decisions",
    statLabel: "Cycle time improved",
    statValue: "41%",
    statSub: "across reporting workflows",
    tags: ["Dashboards", "Data pipeline", "Reporting", "API", "Charts"],
    image: "/images/project7.webp",
  },
];

export const comparisonRows = [
  ["Vetting depth", "Self-reported skills", "Agency internal test", "Technical assessment + references"],
  ["Engineer seniority", "Mixed", "Often junior-heavy", "Senior-only network"],
  ["Time to first profile", "Instant but unvetted", "2-4 weeks", "48 hours"],
  ["Skill coverage", "General", "Usually one stack", "Full-stack, AI, Web3, AWS, mobile"],
  ["Timezone fit", "Random", "Often far offshore", "Africa: UTC+0 to UTC+3"],
  ["Post-placement support", "None", "Account manager", "Technical check-ins"],
];

export const faqItems = [
  {
    q: "What seniority level are the engineers in the Andishi network?",
    a: "All engineers in the network have a minimum of five years of production experience. We focus on engineers who can own a problem inside your stack, not juniors who need heavy oversight.",
  },
  {
    q: "How quickly can we see profiles?",
    a: "After a technical discovery call, Andishi surfaces two to three matched profiles within 48 hours when the right talent is active in the network.",
  },
  {
    q: "What time zones do your engineers work in?",
    a: "African engineers are distributed across UTC+0 to UTC+3, which overlaps cleanly with European business hours and gives US East Coast teams meaningful daily overlap.",
  },
  {
    q: "How is Andishi different from Upwork or a generic outsourcing agency?",
    a: "Andishi is not a marketplace. We do the sourcing, technical assessment, reference checks, matching, onboarding support, and post-placement check-ins ourselves.",
  },
  {
    q: "What happens if a placed engineer is not working out?",
    a: "Every placement includes a 30-day guarantee. If the engagement is not working in the first 30 days, we replace the engineer at no additional cost.",
  },
  {
    q: "Do you still build products for businesses directly?",
    a: "Yes. The Andishi studio arm still builds web applications, e-commerce systems, and conversion sites for African businesses, but talent placement is now the primary offer.",
  },
];
