export type JobKind = "freelance" | "internal" | "outsourced";
export type JobStatus = "draft" | "open" | "closed";
export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface JobOpening {
  id: string;
  title: string;
  slug: string;
  kind: JobKind;
  department: string;
  location: string;
  remote: boolean;
  seniority: string;
  description_md: string;
  skills: string[];
  compensation_note: string;
  status: JobStatus;
  published_at: string;
  org_id?: string; // Optional client/organization for outsourced placement
}

export interface Application {
  id: string;
  job_opening_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_url: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    [key: string]: string | undefined;
  };
  cover_note: string;
  stage: ApplicationStage;
  rating?: number; // 1-5 rating
  created_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  type: string;
  note: string;
  user_name: string;
  occurred_at: string;
}

// ── Default Mock Openings ───────────────────────────────────────────────────
export const defaultOpenings: JobOpening[] = [
  {
    id: "job-ai-engineer",
    title: "Senior AI Integration Engineer",
    slug: "senior-ai-integration-engineer",
    kind: "freelance",
    department: "Engineering",
    location: "Nairobi, Kenya",
    remote: true,
    seniority: "Senior",
    compensation_note: "$8,000 - $12,000 / month",
    status: "open",
    published_at: "2026-06-20T10:00:00Z",
    skills: [
      "Next.js",
      "Python",
      "OpenAI API",
      "LangChain",
      "Vector DBs (Pinecone/pgvector)",
      "TypeScript",
    ],
    description_md: `## The Role
We are seeking a **Senior AI Integration Engineer** to join our talent network on a freelance project contract. You will design, build, and deploy high-fidelity retrieval-augmented generation (RAG) pipelines, custom LLM agents, and support workflow orchestrations for our international clients in the SaaS and FinTech verticals.

## Responsibilities
- Architect and integrate scalable AI agents into existing Next.js / TypeScript applications.
- Optimize prompt engineering strategies, embedding models, and contextual chunking for low-latency search.
- Set up evaluation frameworks (eval traces) to benchmark model outputs, hallucination risk, and cost footprints.
- Collaborate with client stakeholders and Andishi product leads to deliver production-grade software within 8-day sprints.

## Requirements
- 4+ years of professional full-stack development experience, with at least 2 years focusing directly on production LLM architectures.
- Expert knowledge of TypeScript, React/Next.js, Python, and SQL databases.
- Proven experience deploying pgvector or Pinecone in commercial environments.
- High agency, editorial detail, and the ability to work independently with clients in European and US time zones.`,
  },
  {
    id: "job-fullstack-dev",
    title: "Senior Full-Stack Studio Engineer",
    slug: "senior-fullstack-studio-engineer",
    kind: "internal",
    department: "Engineering",
    location: "Nairobi, Kenya",
    remote: false,
    seniority: "Senior",
    compensation_note: "Salary matching studio parameters + full benefits",
    status: "open",
    published_at: "2026-06-25T08:00:00Z",
    skills: [
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Drizzle ORM",
      "Tailwind CSS",
      "TypeScript",
    ],
    description_md: `## The Role
We are looking for a **Senior Full-Stack Studio Engineer** to join Andishi's core product team on-site in Nairobi. You will be responsible for creating client workspaces, scaling our internal dashboard engines, building intake scoping workflows, and engineering premium digital experiences.

## Responsibilities
- Build, test, and ship modular features across Andishi's Next.js portals (Admin Command, Client Workspace, Developer Workbench).
- Write robust, fully-typed database schemas using Drizzle ORM and optimize queries for Neon serverless PostgreSQL.
- Partner directly with our UX design specialists to implement premium glassmorphic UI interfaces, custom micro-animations, and responsive timelines.
- Mentor junior engineers and participate in code reviews to maintain high codebase hygiene.

## Requirements
- 5+ years of full-stack engineering experience, preferably within a fast-paced agency, studio, or high-growth startup.
- Deep familiarity with TypeScript, React Server Components (RSC), Next.js App Router, and Postgres.
- Mastery of modern styling paradigms (CSS Variables, Tailwind) and animation frameworks (Framer Motion, GSAP).
- On-site availability at our bypass business office in Northern Bypass, Ruiru.`,
  },
  {
    id: "job-outsourced-design",
    title: "Senior Product Designer (UX/UI)",
    slug: "senior-product-designer-ux-ui",
    kind: "outsourced",
    department: "Design",
    location: "Nairobi, Kenya",
    remote: true,
    seniority: "Lead / Senior",
    compensation_note: "Client-paid rate card: $65 - $85 / hour",
    status: "open",
    published_at: "2026-06-28T12:00:00Z",
    org_id: "Kijani Analytics",
    skills: [
      "Figma",
      "UI Design System",
      "High-fidelity Prototyping",
      "UX Research",
      "Interactive Micro-interactions",
    ],
    description_md: `## The Role
Andishi is sourcing a **Senior Product Designer** for placement with our partner organization, **Kijani Analytics**, a leading environmental data platform. This is a dedicated outsourced role where you will operate full-time as the lead UI/UX designer for Kijani's core carbon-tracking portal.

## Responsibilities
- Establish a refined, editorial-grade design system inside Figma for Kijani's dynamic maps, timeline charts, and complex widgets.
- Translate highly technical telemetry, spatial layers, and analysis parameters into clean, glassmorphic customer dashboards.
- Produce production-ready high-fidelity Figma components, interactive flows, and animation instructions for frontend teams.
- Conduct user research sessions with international analysts and iterate on usability feedback.

## Requirements
- 4+ years designing high-fidelity dashboards, SaaS layouts, or complex telemetry views.
- A world-class portfolio showcasing clean grid systems, high-end typography choices (Nunito, Outfit, Inter), and detailed design specs.
- Experience collaborating with engineers on CSS parameters and asset handoffs.
- Excellent communication and presentation skills.`,
  },
  {
    id: "job-tech-recruiter",
    title: "Technical Recruiter & Talent Manager",
    slug: "technical-recruiter-talent-manager",
    kind: "internal",
    department: "Operations",
    location: "Nairobi, Kenya",
    remote: false,
    seniority: "Mid-Senior",
    compensation_note: "Competitive salary + placement commissions",
    status: "draft",
    published_at: "2026-07-01T09:00:00Z",
    skills: [
      "Technical Vetting",
      "Applicant Tracking",
      "Interviewing",
      "Operations",
      "Client Communication",
    ],
    description_md: `## The Role
We are seeking a **Technical Recruiter & Talent Manager** to run the supply-side pipeline for Andishi's core team and external client channels. You will own the candidate experience, administer vetting challenges, coordinate shortlists, and scale our network of elite African software engineers.

## Responsibilities
- Screen, vet, and verify engineers applying to join Andishi's network.
- Manage the recruitment pipelines within the super admin console and curate developer slates.
- Partner with client companies to scope talent needs, formulate requirements, and schedule intros.
- Drive employer branding and network expansion events across tech hubs.

## Requirements
- 3+ years experience recruiting developers, designers, or product managers in technical recruiting environments.
- Deep comprehension of engineering concepts, framework jargon (React, LLMs, Vector DBs, Postgres), and compensation structures.
- Exceptionally organized with high empathy and high operational efficiency.`,
  },
];

// ── Default Mock Applications ───────────────────────────────────────────────
export const defaultApplications: Application[] = [
  {
    id: "app-1",
    job_opening_id: "job-ai-engineer",
    applicant_name: "Daniel Mwangi",
    applicant_email: "daniel.mwangi@gmail.com",
    resume_url: "https://example.com/resumes/daniel_mwangi_cv.pdf",
    links: {
      github: "https://github.com/danielmwangi-ai",
      linkedin: "https://linkedin.com/in/danielmwangi-vet",
      portfolio: "https://danielm.dev",
    },
    cover_note:
      "I have been building LLM agents and production RAG systems for the past 2 years. I've worked extensively with LangChain and pgvector and would love to work on freelance contracts through Andishi.",
    stage: "interview",
    rating: 5,
    created_at: "2026-06-22T14:30:00Z",
  },
  {
    id: "app-2",
    job_opening_id: "job-ai-engineer",
    applicant_name: "Sarah Jenkins",
    applicant_email: "s.jenkins@outlook.com",
    resume_url: "https://example.com/resumes/sarah_jenkins.pdf",
    links: {
      github: "https://github.com/sjenkins-codes",
      linkedin: "https://linkedin.com/in/sarah-jenkins-dev",
    },
    cover_note:
      "Hello! I am a full-stack engineer who recently transitioned to focus heavily on vector databases and prompt engineering. I'm keen to learn more about the client portfolios at Andishi.",
    stage: "screening",
    rating: 3,
    created_at: "2026-06-23T09:15:00Z",
  },
  {
    id: "app-3",
    job_opening_id: "job-fullstack-dev",
    applicant_name: "Erick Omondi",
    applicant_email: "erick.omondi@dev.co.ke",
    resume_url: "https://example.com/resumes/erick_omondi_resume.pdf",
    links: {
      github: "https://github.com/erick-omondi",
      linkedin: "https://linkedin.com/in/erickomondi",
    },
    cover_note:
      "I am based in Nairobi and am very excited about Andishi's pivot into a software development studio. I have built multiple Next.js dashboards and would love to contribute on-site.",
    stage: "applied",
    rating: 4,
    created_at: "2026-06-26T16:45:00Z",
  },
  {
    id: "app-4",
    job_opening_id: "job-outsourced-design",
    applicant_name: "Halima Abdi",
    applicant_email: "halima.abdi.design@gmail.com",
    resume_url: "https://example.com/resumes/halima_abdi_portfolio.pdf",
    links: {
      linkedin: "https://linkedin.com/in/halima-abdi-ux",
      portfolio: "https://halima.design",
    },
    cover_note:
      "I specialize in clean, data-rich analytical platforms and mapping portals. Kijani Analytics' green technology focus matches my passion. Check out my portfolio for SaaS telemetry designs.",
    stage: "offer",
    rating: 5,
    created_at: "2026-06-29T11:00:00Z",
  },
];

export const defaultEvents: ApplicationEvent[] = [
  {
    id: "evt-1",
    application_id: "app-1",
    type: "status_change",
    note: "Application submitted",
    user_name: "System",
    occurred_at: "2026-06-22T14:30:00Z",
  },
  {
    id: "evt-2",
    application_id: "app-1",
    type: "status_change",
    note: "Candidate moved to Screening",
    user_name: "Dennis (Ops)",
    occurred_at: "2026-06-22T16:00:00Z",
  },
  {
    id: "evt-3",
    application_id: "app-1",
    type: "rating_assigned",
    note: "Rated 5 stars: Strong pgvector production background",
    user_name: "Dennis (Ops)",
    occurred_at: "2026-06-22T16:05:00Z",
  },
  {
    id: "evt-4",
    application_id: "app-1",
    type: "status_change",
    note: "Candidate scheduled for Technical Interview",
    user_name: "Dennis (Ops)",
    occurred_at: "2026-06-24T10:00:00Z",
  },
];

// ── Local Storage State Managers ────────────────────────────────────────────

const STORAGE_KEYS = {
  OPENINGS: "andishi_careers_openings",
  APPLICATIONS: "andishi_careers_applications",
  EVENTS: "andishi_careers_events",
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error("Error reading localStorage key", key, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error writing localStorage key", key, e);
  }
}

// Openings API
export function getJobOpenings(): JobOpening[] {
  return getStorageItem<JobOpening[]>(STORAGE_KEYS.OPENINGS, defaultOpenings);
}

export function getJobBySlug(slug: string): JobOpening | undefined {
  const openings = getJobOpenings();
  return openings.find((job) => job.slug === slug);
}

export function saveJobOpening(job: JobOpening): void {
  const openings = getJobOpenings();
  const idx = openings.findIndex((o) => o.id === job.id);
  if (idx > -1) {
    openings[idx] = job;
  } else {
    openings.push(job);
  }
  setStorageItem(STORAGE_KEYS.OPENINGS, openings);
}

export function deleteJobOpening(id: string): void {
  const openings = getJobOpenings();
  const filtered = openings.filter((o) => o.id !== id);
  setStorageItem(STORAGE_KEYS.OPENINGS, filtered);
}

// Applications API
export function getApplications(): Application[] {
  return getStorageItem<Application[]>(STORAGE_KEYS.APPLICATIONS, defaultApplications);
}

export function saveApplication(app: Application): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === app.id);
  if (idx > -1) {
    apps[idx] = app;
  } else {
    apps.push(app);
  }
  setStorageItem(STORAGE_KEYS.APPLICATIONS, apps);

  // Add initial event log
  const event: ApplicationEvent = {
    id: `evt-${Date.now()}`,
    application_id: app.id,
    type: "status_change",
    note: "Application submitted via Careers Portal",
    user_name: "System",
    occurred_at: new Date().toISOString(),
  };
  saveEvent(event);
}

// Events API
export function getEventsForApplication(appId: string): ApplicationEvent[] {
  const allEvents = getStorageItem<ApplicationEvent[]>(STORAGE_KEYS.EVENTS, defaultEvents);
  return allEvents.filter((e) => e.application_id === appId);
}

export function saveEvent(event: ApplicationEvent): void {
  const allEvents = getStorageItem<ApplicationEvent[]>(STORAGE_KEYS.EVENTS, defaultEvents);
  allEvents.push(event);
  setStorageItem(STORAGE_KEYS.EVENTS, allEvents);
}

export function updateApplicationStage(
  appId: string,
  stage: ApplicationStage,
  operatorName: string,
): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx > -1) {
    const oldStage = apps[idx].stage;
    apps[idx].stage = stage;
    setStorageItem(STORAGE_KEYS.APPLICATIONS, apps);

    // log event
    const event: ApplicationEvent = {
      id: `evt-${Date.now()}`,
      application_id: appId,
      type: "status_change",
      note: `Moved from ${oldStage} to ${stage}`,
      user_name: operatorName,
      occurred_at: new Date().toISOString(),
    };
    saveEvent(event);
  }
}

export function updateApplicationRating(appId: string, rating: number, operatorName: string): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx > -1) {
    apps[idx].rating = rating;
    setStorageItem(STORAGE_KEYS.APPLICATIONS, apps);

    // log event
    const event: ApplicationEvent = {
      id: `evt-${Date.now()}`,
      application_id: appId,
      type: "rating_assigned",
      note: `Rated ${rating} stars`,
      user_name: operatorName,
      occurred_at: new Date().toISOString(),
    };
    saveEvent(event);
  }
}

// Reset Storage Helper (Useful for testing)
export function resetCareersStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.OPENINGS);
  localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
}
