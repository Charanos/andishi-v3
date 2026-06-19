export type Engineer = {
  slug: string;
  name: string;
  role: string;
  yearsExp: number;
  skills: string[];
  domains: Array<"fullstack" | "ai" | "web3" | "aws">;
  location: { city: string; country: string; utcOffset: number };
  availability: "now" | string;
  bio: string;
  longBio: string[];
  highlights: string[];
  assessment: {
    systemDesign: boolean;
    codeReview: boolean;
    architectureChallenge: boolean;
  };
  workHistory: Array<{ company: string; role: string; duration: string }>;
  githubUrl?: string;
  portfolioUrl?: string;
  featured: boolean;
  avatar: string;
};

export const engineers: Engineer[] = [
  {
    slug: "amina-otieno",
    name: "Amina Otieno",
    role: "Senior Full-Stack Engineer",
    yearsExp: 8,
    skills: ["Next.js", "React", "Node.js", "PostgreSQL", "AWS", "TypeScript"],
    domains: ["fullstack", "aws"],
    location: { city: "Nairobi", country: "Kenya", utcOffset: 3 },
    availability: "now",
    bio: "Amina owns product features end-to-end, from data modeling to polished client interfaces. She is strongest in B2B SaaS, payments, and internal tools.",
    longBio: [
      "I like product work where the engineering problem is tied directly to operational clarity. My strongest work has been on full-stack systems with complex permissions, reporting, and payment flows.",
      "I am comfortable joining existing teams, reading through a mature codebase, and turning ambiguous product needs into clean milestones. I care about maintainability because every shortcut eventually lands on someone else's desk.",
    ],
    highlights: [
      "Led a payments reconciliation dashboard that reached 98.3% match accuracy.",
      "Refactored a multi-tenant SaaS permission model without customer downtime.",
      "Mentored two mid-level engineers while owning a critical reporting workstream.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Fintech scale-up", role: "Senior Product Engineer", duration: "2023-2026" },
      { company: "B2B SaaS platform", role: "Full-Stack Engineer", duration: "2020-2023" },
      { company: "Commerce startup", role: "Frontend Engineer", duration: "2017-2020" },
    ],
    githubUrl: "https://github.com",
    portfolioUrl: "/work/lipa-commerce",
    featured: true,
    avatar: "/images/dev1.jpg",
  },
  {
    slug: "kwame-mensah",
    name: "Kwame Mensah",
    role: "AI Product Engineer",
    yearsExp: 7,
    skills: ["Python", "RAG", "OpenAI", "LangChain", "FastAPI", "PostgreSQL"],
    domains: ["ai", "fullstack"],
    location: { city: "Accra", country: "Ghana", utcOffset: 0 },
    availability: "now",
    bio: "Kwame builds production AI workflows with evaluation, retrieval, and cost controls. He is a strong fit for teams turning LLM prototypes into product features.",
    longBio: [
      "My AI work sits close to product engineering: retrieval quality, latency, cost, user feedback loops, and safe deployment. I prefer measurable systems over impressive demos.",
      "I have helped teams move from notebooks and proof-of-concepts into APIs, background jobs, and interfaces that real users can depend on.",
    ],
    highlights: [
      "Built a RAG support assistant with source attribution and evaluation traces.",
      "Reduced LLM workflow costs by 37% through caching and model routing.",
      "Designed guardrails for a document automation product serving legal teams.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "AI operations SaaS", role: "AI Product Engineer", duration: "2024-2026" },
      { company: "Data consultancy", role: "Backend Engineer", duration: "2021-2024" },
      { company: "Healthtech startup", role: "Python Engineer", duration: "2018-2021" },
    ],
    githubUrl: "https://github.com",
    portfolioUrl: "/skills/ai",
    featured: true,
    avatar: "/images/dev2.jpg",
  },
  {
    slug: "zainab-bello",
    name: "Zainab Bello",
    role: "Cloud / AWS Engineer",
    yearsExp: 9,
    skills: ["AWS", "Terraform", "ECS", "RDS", "Lambda", "Observability"],
    domains: ["aws"],
    location: { city: "Lagos", country: "Nigeria", utcOffset: 1 },
    availability: "2026-06-10",
    bio: "Zainab stabilizes cloud systems, deployment pipelines, and infrastructure cost. She is strongest with AWS-heavy products that need reliability without heavyweight process.",
    longBio: [
      "I focus on infrastructure that lets product teams move faster without creating operational debt. Most of my work sits around AWS, Terraform, CI/CD, monitoring, and reliability reviews.",
      "I enjoy joining teams at the point where growth has outpaced the original infrastructure and the system needs calmer foundations.",
    ],
    highlights: [
      "Cut cloud spend by 29% while improving service reliability.",
      "Migrated a monolith deployment to ECS with zero planned downtime.",
      "Implemented alerts and runbooks that reduced incident response time.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Logistics platform", role: "Senior Cloud Engineer", duration: "2022-2026" },
      { company: "Fintech infrastructure team", role: "DevOps Engineer", duration: "2019-2022" },
      { company: "Managed services firm", role: "Systems Engineer", duration: "2016-2019" },
    ],
    githubUrl: "https://github.com",
    portfolioUrl: "/skills/aws",
    featured: true,
    avatar: "/images/dev3.jpg",
  },
  {
    slug: "daniel-kato",
    name: "Daniel Kato",
    role: "Backend API Engineer",
    yearsExp: 6,
    skills: ["Go", "Node.js", "GraphQL", "Redis", "PostgreSQL", "Payments"],
    domains: ["fullstack"],
    location: { city: "Kampala", country: "Uganda", utcOffset: 3 },
    availability: "now",
    bio: "Daniel builds APIs, data flows, and payment integrations for teams that need reliable backend ownership.",
    longBio: [
      "I work best on backend systems where reliability and clean data contracts matter. I like APIs, queues, payment flows, and the parts of a product users only notice when they break.",
      "My default mode is to understand the current system before changing it, then leave behind tests, metrics, and documentation that make the next change easier.",
    ],
    highlights: [
      "Rebuilt transaction retry logic for a commerce platform.",
      "Designed GraphQL contracts used by web and mobile teams.",
      "Improved queue throughput by 44% on a high-volume notification service.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Commerce API team", role: "Backend Engineer", duration: "2021-2026" },
      { company: "Payments startup", role: "Software Engineer", duration: "2018-2021" },
    ],
    featured: false,
    avatar: "/images/dev4.jpg",
  },
  {
    slug: "nadia-hassan",
    name: "Nadia Hassan",
    role: "Web3 Engineer",
    yearsExp: 7,
    skills: ["Solidity", "Ethereum", "Hardhat", "Node.js", "DeFi", "Security"],
    domains: ["web3", "fullstack"],
    location: { city: "Cairo", country: "Egypt", utcOffset: 3 },
    availability: "now",
    bio: "Nadia ships smart-contract and wallet integrations with a security-first mindset and product engineering discipline.",
    longBio: [
      "My work is strongest at the point where contracts, frontends, wallets, and off-chain services meet. I care about clarity because Web3 systems can fail in expensive ways.",
      "I have worked with teams on DeFi integrations, wallet flows, audits, and token-gated product experiences.",
    ],
    highlights: [
      "Audited and patched access-control issues before mainnet launch.",
      "Built wallet onboarding flows that reduced support tickets.",
      "Integrated contract events into a real-time operations dashboard.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "DeFi protocol", role: "Smart Contract Engineer", duration: "2022-2026" },
      { company: "Crypto wallet startup", role: "Full-Stack Engineer", duration: "2019-2022" },
    ],
    githubUrl: "https://github.com",
    portfolioUrl: "/skills/web3",
    featured: false,
    avatar: "/images/dev5.jpg",
  },
  {
    slug: "thabo-mokoena",
    name: "Thabo Mokoena",
    role: "Senior Frontend Engineer",
    yearsExp: 8,
    skills: ["React", "Next.js", "Design Systems", "TypeScript", "Testing"],
    domains: ["fullstack"],
    location: { city: "Cape Town", country: "South Africa", utcOffset: 2 },
    availability: "2026-05-30",
    bio: "Thabo turns complex product workflows into fast, accessible interfaces with strong component architecture.",
    longBio: [
      "I enjoy frontend work that has real workflow complexity: dashboards, role-based applications, design systems, and interfaces people use every day.",
      "My background is product engineering, so I care about API contracts, performance, accessibility, and team handoff as much as visual polish.",
    ],
    highlights: [
      "Built a design system adopted across four product squads.",
      "Improved dashboard interaction latency by 52%.",
      "Led accessibility fixes for a high-traffic customer portal.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Enterprise SaaS", role: "Senior Frontend Engineer", duration: "2020-2026" },
      { company: "Marketplace startup", role: "React Engineer", duration: "2017-2020" },
    ],
    featured: false,
    avatar: "/images/dev6.jpg",
  },
  {
    slug: "mariam-traore",
    name: "Mariam Traore",
    role: "Mobile Engineer",
    yearsExp: 6,
    skills: ["React Native", "Swift", "Kotlin", "Offline Sync", "Firebase"],
    domains: ["fullstack"],
    location: { city: "Dakar", country: "Senegal", utcOffset: 0 },
    availability: "now",
    bio: "Mariam builds mobile products that account for real-world network, device, and payment constraints.",
    longBio: [
      "I like mobile products that need to work in imperfect conditions. Offline sync, push notifications, payments, app store release quality, and analytics are all part of my usual work.",
      "I am comfortable collaborating with product and backend teams to make mobile flows reliable rather than merely good-looking.",
    ],
    highlights: [
      "Shipped offline-first field workflows for distributed teams.",
      "Reduced crash rate below 0.4% on a React Native app.",
      "Led app store release process for iOS and Android.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Field operations startup", role: "Mobile Engineer", duration: "2021-2026" },
      { company: "Consumer fintech", role: "React Native Engineer", duration: "2018-2021" },
    ],
    featured: false,
    avatar: "/images/dev7.jpg",
  },
  {
    slug: "samuel-adebayo",
    name: "Samuel Adebayo",
    role: "Data Product Engineer",
    yearsExp: 7,
    skills: ["Python", "dbt", "PostgreSQL", "Dashboards", "APIs", "AWS"],
    domains: ["ai", "aws"],
    location: { city: "Abuja", country: "Nigeria", utcOffset: 1 },
    availability: "now",
    bio: "Samuel connects product, data, and backend systems so operational teams can make faster decisions.",
    longBio: [
      "My work is usually about turning scattered operational data into useful product surfaces: dashboards, reporting APIs, decision tools, and data pipelines that are understandable.",
      "I bring enough backend depth to make data products reliable and enough product sense to avoid dashboards nobody uses.",
    ],
    highlights: [
      "Created analytics workflows that improved decision speed by 41%.",
      "Built reporting APIs used across finance and operations teams.",
      "Stabilized nightly data pipelines with monitoring and retries.",
    ],
    assessment: { systemDesign: true, codeReview: true, architectureChallenge: true },
    workHistory: [
      { company: "Analytics SaaS", role: "Data Product Engineer", duration: "2022-2026" },
      { company: "Operations platform", role: "Backend/Data Engineer", duration: "2019-2022" },
    ],
    featured: false,
    avatar: "/images/dev8.jpg",
  },
];

export const engineerRoles = [
  "All",
  "Full-Stack",
  "Frontend",
  "Backend",
  "AI/ML",
  "Cloud/AWS",
  "Web3",
  "Mobile",
] as const;

export function getEngineer(slug: string) {
  return engineers.find((engineer) => engineer.slug === slug);
}

export function getFeaturedEngineers(limit = 3) {
  return engineers.filter((engineer) => engineer.featured).slice(0, limit);
}

export function getEngineersByDomain(domain: Engineer["domains"][number], limit = 3) {
  return engineers.filter((engineer) => engineer.domains.includes(domain)).slice(0, limit);
}
