import type { Engineer } from "@/data/engineers";

export type SkillDomain = "fullstack" | "ai" | "web3" | "aws";

export type SkillDomainData = {
  slug: SkillDomain;
  label: string;
  eyebrow: string;
  h1: string;
  subheadline: string;
  technologies: string[];
  useCases: string[];
  differentiators: string[];
  faq: Array<{ q: string; a: string }>;
};

export const skillDomains: Record<SkillDomain, SkillDomainData> = {
  fullstack: {
    slug: "fullstack",
    label: "Full-stack",
    eyebrow: "Full-stack talent",
    h1: "Senior Full-Stack Engineers, Ready to Embed.",
    subheadline:
      "React, Next.js, Node.js, Python, TypeScript, and PostgreSQL engineers who can own product features from interface to infrastructure.",
    technologies: ["React", "Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "GraphQL", "AWS"],
    useCases: [
      "MVPs and new product tracks",
      "B2B SaaS dashboards and internal tools",
      "API integrations and payment flows",
      "Design-system-backed product interfaces",
    ],
    differentiators: [
      "Engineers are vetted for end-to-end ownership, not isolated framework trivia.",
      "Profiles include production history, timezone fit, and assessment signals.",
      "Africa-based time zones give useful overlap with Europe and US East.",
    ],
    faq: [
      {
        q: "Can Andishi full-stack engineers join an existing team?",
        a: "Yes. Full-stack engineers can embed into existing product teams, work inside your sprint process, and take ownership of defined features or workstreams.",
      },
      {
        q: "Which stacks are covered?",
        a: "Common coverage includes React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, GraphQL, REST APIs, and AWS deployment patterns.",
      },
      {
        q: "Can one engineer own frontend and backend work?",
        a: "Yes, when the scope is well framed. Andishi matches for engineers who have shipped across interface, API, data, and deployment boundaries.",
      },
      {
        q: "How fast can a full-stack engineer start?",
        a: "The usual target is first shortlisted profiles within eight days after a complete brief, with faster starts when an active engineer matches the need.",
      },
    ],
  },
  ai: {
    slug: "ai",
    label: "AI",
    eyebrow: "AI product talent",
    h1: "AI Engineers Who Turn Prototypes Into Product.",
    subheadline:
      "LLM, RAG, Python, evaluation, automation, and AI workflow engineers for teams moving beyond demos into production systems.",
    technologies: ["OpenAI", "Claude", "RAG", "Python", "FastAPI", "Vector DBs", "Evaluation", "TypeScript"],
    useCases: [
      "LLM product features and assistants",
      "Retrieval systems with source attribution",
      "AI workflow automation and tool calling",
      "Evaluation, cost controls, and deployment hardening",
    ],
    differentiators: [
      "AI engineers are screened for product judgment and production deployment habits.",
      "Shortlists emphasize evaluation, safety, latency, and cost awareness.",
      "Engineers can work with your current product team instead of operating as a research silo.",
    ],
    faq: [
      {
        q: "Do Andishi AI engineers only build prototypes?",
        a: "No. The focus is production AI: APIs, retrieval quality, evaluation, UX integration, cost control, and deployment patterns that real users can depend on.",
      },
      {
        q: "Can engineers work with our existing model provider?",
        a: "Yes. Matching can cover OpenAI, Anthropic, Google, open-source models, vector databases, and existing cloud or data infrastructure.",
      },
      {
        q: "Can an AI engineer work with our product roadmap?",
        a: "Yes. Andishi prioritizes engineers who can translate product goals into reliable AI workflows rather than building disconnected experiments.",
      },
      {
        q: "What should we include in an AI hiring brief?",
        a: "Share the user workflow, data sources, risk constraints, model/provider preferences, current prototype state, and what the engineer should own in 90 days.",
      },
    ],
  },
  web3: {
    slug: "web3",
    label: "Web3",
    eyebrow: "Web3 talent",
    h1: "Web3 Engineers With Mainnet Judgment.",
    subheadline:
      "Solidity, EVM, wallet, DeFi, smart-contract, and full-stack Web3 engineers for teams that need careful shipping, not tutorial code.",
    technologies: ["Solidity", "Ethereum", "Polygon", "Hardhat", "Foundry", "Ethers", "DeFi", "Node.js"],
    useCases: [
      "Smart contract development and review",
      "Wallet onboarding and token-gated products",
      "DeFi integrations and protocol tooling",
      "Event indexing and operational dashboards",
    ],
    differentiators: [
      "Profiles emphasize shipped systems and security mindset.",
      "Engineers can cover contracts, frontends, and off-chain services.",
      "The matching process checks for real product context beyond Web3 keywords.",
    ],
    faq: [
      {
        q: "Can Andishi support smart contract work?",
        a: "Yes. Web3 engineers can support Solidity development, contract review, test suites, deployment workflows, and integration with product frontends.",
      },
      {
        q: "Do you cover wallet and frontend integration?",
        a: "Yes. Many Web3 engagements need both contract fluency and product engineering across wallet flows, event data, dashboards, and APIs.",
      },
      {
        q: "Is security review included?",
        a: "Engineers are matched with security awareness, but formal third-party audits should be scoped separately for high-value or mainnet-critical systems.",
      },
      {
        q: "Can Web3 work be project-based?",
        a: "Yes. Web3 engagements are often project-based when the scope is a contract module, integration, audit preparation, or launch support track.",
      },
    ],
  },
  aws: {
    slug: "aws",
    label: "AWS",
    eyebrow: "Cloud talent",
    h1: "AWS Engineers For Reliable Product Infrastructure.",
    subheadline:
      "AWS, Terraform, ECS, Lambda, RDS, observability, CI/CD, and reliability engineers for teams that need calm production systems.",
    technologies: ["AWS", "Terraform", "ECS", "Lambda", "RDS", "CloudWatch", "CDK", "PostgreSQL"],
    useCases: [
      "Infrastructure reviews and cost reduction",
      "Deployment pipelines and environment setup",
      "Database, monitoring, and incident readiness",
      "Migration from fragile hosting to AWS foundations",
    ],
    differentiators: [
      "Engineers are vetted for production judgment and operational clarity.",
      "Shortlists account for your current architecture and team maturity.",
      "Cloud talent can work fractionally or embed alongside your product team.",
    ],
    faq: [
      {
        q: "Can Andishi AWS engineers work fractionally?",
        a: "Yes. Cloud needs are often fractional, especially for architecture review, deployment stabilization, observability, and cost-control work.",
      },
      {
        q: "Which AWS services are covered?",
        a: "Common coverage includes ECS, Lambda, RDS, EC2, S3, CloudFront, IAM, CloudWatch, CDK, Terraform, and deployment pipelines.",
      },
      {
        q: "Can engineers improve existing infrastructure?",
        a: "Yes. Many engagements begin with an audit of current hosting, deployment, monitoring, cost, and reliability pain before implementation begins.",
      },
      {
        q: "Do cloud engineers handle app code too?",
        a: "Some do. Matching can prioritize infrastructure-only specialists or backend/cloud engineers who can work across application and deployment layers.",
      },
    ],
  },
};

export const skillDomainList = Object.values(skillDomains);

export function domainForEngineer(engineer: Engineer) {
  return engineer.domains[0];
}
