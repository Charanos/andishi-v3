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
    eyebrow: "Product Engineering",
    h1: "Custom Full-Stack Product Development.",
    subheadline:
      "We design, build, and deploy full-stack products from database schema to modern interface using React, Next.js, Node.js, Python, TypeScript, and AWS.",
    technologies: ["React", "Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "GraphQL", "AWS"],
    useCases: [
      "Custom B2B SaaS platforms and dashboards",
      "Full-stack web applications and internal tools",
      "Third-party API integrations and payment gateways",
      "Modern, design-system-backed web interfaces",
    ],
    differentiators: [
      "We focus on product outcomes and end-to-end ownership, not just completing isolated sprint tasks.",
      "We build with production-grade stacks, ensuring strict type-safety and long-term maintainability.",
      "Our Nairobi-based timezone offers convenient overlap for teams in Europe and the Americas.",
    ],
    faq: [
      {
        q: "Can Andishi full-stack engineers join an existing team?",
        a: "Yes. In addition to delivering full products, our senior engineers can embed into your existing team, work inside your sprints, and own complex feature tracks.",
      },
      {
        q: "Which stacks are covered?",
        a: "We specialize in React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, GraphQL, REST APIs, and AWS deployment patterns.",
      },
      {
        q: "Can you own both frontend and backend work?",
        a: "Yes. Our engineers work across the entire stack, managing database design, API implementation, and pixel-perfect responsive interfaces.",
      },
      {
        q: "How fast can we start a project?",
        a: "We can initiate scoping immediately. For custom builds, we typically align on requirements and kick off development within a week.",
      },
    ],
  },
  ai: {
    slug: "ai",
    label: "AI",
    eyebrow: "Intelligent Systems",
    h1: "Production-Grade AI & Intelligent Systems.",
    subheadline:
      "We build and deploy intelligent features, custom LLM integrations, retrieval systems (RAG), and automated workflows that scale safely.",
    technologies: ["OpenAI", "Claude", "RAG", "Python", "FastAPI", "Vector DBs", "Evaluation", "TypeScript"],
    useCases: [
      "Custom LLM integrations and agentic workflows",
      "Semantic search & RAG systems with high accuracy",
      "AI-driven workflow automation and tool call pipelines",
      "Model evaluation, cost optimization, and safety guardrails",
    ],
    differentiators: [
      "We focus on production AI - prioritizing low latency, high retrieval quality, and strict cost controls.",
      "We design smooth user experiences around AI limitations, ensuring a premium feel.",
      "We integrate intelligent agents directly into your product rather than running isolated experiments.",
    ],
    faq: [
      {
        q: "Do you only build AI prototypes?",
        a: "No. We focus on production-grade AI systems: robust APIs, precise evaluation pipelines, security guardrails, and cost-efficient scaling.",
      },
      {
        q: "Which model providers and vector databases do you support?",
        a: "We build with OpenAI, Anthropic, Google Gemini, open-source models, and vector stores like Pinecone, pgvector, and Qdrant.",
      },
      {
        q: "Can you help us integrate AI into an existing web or mobile app?",
        a: "Yes. We can design and implement AI features that connect seamlessly with your current database, APIs, and frontend interfaces.",
      },
      {
        q: "How do you handle data privacy and model costs?",
        a: "We implement caching strategies, prompt optimizations, and robust schema validations to control API costs, alongside secure data handling practices.",
      },
    ],
  },
  web3: {
    slug: "web3",
    label: "Web3",
    eyebrow: "Decentralized Tech",
    h1: "Secure Smart Contracts & Web3 Apps.",
    subheadline:
      "We design secure smart contracts, dApps, wallet onboarding flows, and decentralized protocols with mainnet-grade engineering.",
    technologies: ["Solidity", "Ethereum", "Polygon", "Hardhat", "Foundry", "Ethers", "DeFi", "Node.js"],
    useCases: [
      "Secure smart contract development & optimization",
      "Seamless wallet onboarding and token-gated flows",
      "DeFi integrations, liquidity pools, and protocol tools",
      "Real-time event indexing and off-chain sync dashboards",
    ],
    differentiators: [
      "Security-first mindset with extensive testing (Hardhat/Foundry) before mainnet deployment.",
      "We bridge the gap between smart contract logic and modern, high-fidelity user experiences.",
      "We build clean off-chain database syncs to power fast, responsive dashboards.",
    ],
    faq: [
      {
        q: "Do you provide smart contract development?",
        a: "Yes. We write, test, and optimize smart contracts in Solidity and Vyper, utilizing modern testing frameworks like Foundry and Hardhat.",
      },
      {
        q: "Can you build the frontend and wallet integration?",
        a: "Yes. We build complete decentralized applications (dApps), integrating wallet connection kits, token gates, and real-time state tracking.",
      },
      {
        q: "Do you conduct security audits?",
        a: "We follow strict security patterns, write detailed test coverage, and prepare contracts for formal audits. We recommend third-party audits for high-value deployments.",
      },
      {
        q: "Can we hire individual Web3 engineers?",
        a: "Yes, we offer both dedicated engineer placement for Web3 projects and full-cycle development of decentralized platforms.",
      },
    ],
  },
  aws: {
    slug: "aws",
    label: "AWS",
    eyebrow: "Cloud & DevOps",
    h1: "Scalable Cloud Infrastructure & DevOps.",
    subheadline:
      "We design, deploy, and manage secure AWS infrastructure, automated CI/CD pipelines, and robust database clustering using Terraform.",
    technologies: ["AWS", "Terraform", "ECS", "Lambda", "RDS", "CloudWatch", "CDK", "PostgreSQL"],
    useCases: [
      "Infrastructure-as-Code setups via Terraform and CDK",
      "Containerized deployments with AWS ECS/Fargate & EKS",
      "Serverless architectures utilizing Lambda & API Gateway",
      "Cost optimization, observability setups, and CI/CD pipelines",
    ],
    differentiators: [
      "We model all cloud infrastructure in code, ensuring reproducible and secure environments.",
      "We focus on cost control, regularly reducing cloud spend while increasing performance.",
      "We build robust monitoring, alerting, and logging systems for peace-of-mind operations.",
    ],
    faq: [
      {
        q: "Can you help optimize our current cloud spending?",
        a: "Yes. We perform infrastructure audits to identify idle resources, recommend modern sizing, and optimize compute/storage to lower your monthly AWS bill.",
      },
      {
        q: "How do you handle infrastructure migration?",
        a: "We plan and execute minimal-downtime migrations from legacy setups or other cloud hosting platforms into clean, Terraform-managed AWS architectures.",
      },
      {
        q: "Do you set up deployment pipelines?",
        a: "Yes. We build secure CI/CD pipelines using GitHub Actions, AWS CodePipeline, or GitLab CI to automate testing and zero-downtime deployments.",
      },
      {
        q: "Can we engage you for ongoing DevOps support?",
        a: "Yes. We offer both project-based infrastructure setups and ongoing reliability engineering to monitor and manage your cloud environments.",
      },
    ],
  },
};

export const skillDomainList = Object.values(skillDomains);

export function domainForEngineer(engineer: Engineer) {
  return engineer.domains[0];
}
