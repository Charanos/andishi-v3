export const demoIds = {
  adminUser: "11111111-1111-4111-8111-111111111111",
  clientUser: "22222222-2222-4222-8222-222222222222",
  developerUser: "33333333-3333-4333-8333-333333333333",
  organization: "44444444-4444-4444-8444-444444444444",
  engineer: "55555555-5555-4555-8555-555555555555",
  engineerTwo: "66666666-6666-4666-8666-666666666666",
  brief: "77777777-7777-4777-8777-777777777777",
  briefTwo: "88888888-8888-4888-8888-888888888888",
  match: "99999999-9999-4999-8999-999999999999",
  matchTwo: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  placement: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  project: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  projectTwo: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  invoice: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  timesheet: "ffffffff-ffff-4fff-8fff-ffffffffffff",
};

export const demoUsers = [
  {
    id: demoIds.adminUser,
    email: "dennis@andishi.dev",
    name: "Ian Mwangi",
    role: "admin",
    status: "active",
    emailVerified: true,
  },
  {
    id: demoIds.clientUser,
    email: "client@andishi.dev",
    name: "Maya Kamau",
    role: "client",
    status: "active",
    emailVerified: true,
    organizationId: demoIds.organization,
  },
  {
    id: demoIds.developerUser,
    email: "developer@andishi.dev",
    name: "Amina Otieno",
    role: "developer",
    status: "active",
    emailVerified: true,
    engineerId: demoIds.engineer,
  },
] as const;

export const demoOrganizations = [
  {
    id: demoIds.organization,
    name: "Kijani Analytics",
    website: "https://kijani.example",
    industry: "Climate fintech",
    stage: "series_a",
    billingEmail: "finance@kijani.example",
  },
] as const;

export const demoEngineers = [
  {
    id: demoIds.engineer,
    userId: demoIds.developerUser,
    slug: "amina-otieno",
    name: "Amina Otieno",
    role: "Senior AI Product Engineer",
    domain: "ai",
    domainLabel: "AI/ML",
    avatar: "AO",
    avatarColor: "#2f80ed",
    avatarUrl: "/images/dev1.jpg",
    yearsExp: 8,
    location: "Nairobi, Kenya",
    timezone: "UTC+3",
    availability: "available",
    availableFrom: null,
    bio: "Amina builds production LLM workflows with evaluation, retrieval, and human review loops baked in from day one.",
    highlight: "Shipped RAG support automation used by 40k monthly customers.",
    skills: ["Next.js", "Python", "RAG", "OpenAI", "Postgres", "AWS"],
    workHistory: [
      {
        company: "Safaricom Labs",
        role: "Lead AI Engineer",
        period: "2021-2025",
        achievement: "Led evaluation tooling for customer support models.",
      },
    ],
    stats: [
      { label: "Years", value: "8" },
      { label: "Launches", value: "12" },
    ],
    githubUrl: "https://github.com/amina-demo",
    linkedinUrl: "https://linkedin.com/in/amina-demo",
    portfolioUrl: "https://amina.example",
    profileComplete: true,
    isPublic: true,
    verified: true,
  },
  {
    id: demoIds.engineerTwo,
    userId: demoIds.adminUser,
    slug: "kwame-mensah",
    name: "Kwame Mensah",
    role: "Senior Full-Stack Engineer",
    domain: "fullstack",
    domainLabel: "Full-Stack",
    avatar: "KM",
    avatarColor: "#17a589",
    avatarUrl: "/images/dev2.jpg",
    yearsExp: 9,
    location: "Accra, Ghana",
    timezone: "UTC+0",
    availability: "soon",
    availableFrom: "2026-06-10",
    bio: "Kwame specializes in B2B SaaS rebuilds, payments integrations, and high-confidence migrations.",
    highlight: "Migrated a commerce platform to Next.js without downtime.",
    skills: ["React", "Node.js", "Postgres", "Payments", "AWS"],
    workHistory: [
      {
        company: "Mansa Commerce",
        role: "Principal Engineer",
        period: "2020-2025",
        achievement: "Rebuilt checkout and reconciliation systems.",
      },
    ],
    stats: [
      { label: "Years", value: "9" },
      { label: "Uptime", value: "99.9%" },
    ],
    githubUrl: "https://github.com/kwame-demo",
    linkedinUrl: "https://linkedin.com/in/kwame-demo",
    portfolioUrl: "https://kwame.example",
    profileComplete: true,
    isPublic: true,
    verified: true,
  },
] as const;

export const demoBriefs = [
  {
    id: demoIds.brief,
    organizationId: demoIds.organization,
    submittedById: demoIds.clientUser,
    title: "Senior AI engineer for customer support workflow",
    role: "AI Product Engineer",
    domain: "ai",
    seniority: "senior",
    stackTags: ["Next.js", "Python", "RAG", "Postgres", "AWS"],
    timeline: "Start within 2 weeks",
    engagementModel: "embedded",
    description:
      "Kijani needs a senior engineer to productionize a customer support RAG workflow with evaluation traces, admin review, and escalation handling.",
    status: "shortlisted",
    andishiNotes: "Strong AI fit. Prioritize engineers with evaluation and product workflow experience.",
    submittedAt: "2026-05-18T08:30:00.000Z",
  },
  {
    id: demoIds.briefTwo,
    organizationId: demoIds.organization,
    submittedById: demoIds.clientUser,
    title: "Full-stack engineer for payments reconciliation",
    role: "Senior Full-Stack Engineer",
    domain: "fullstack",
    seniority: "lead",
    stackTags: ["Next.js", "Node.js", "Postgres", "M-Pesa"],
    timeline: "Kickoff next month",
    engagementModel: "project",
    description:
      "Build a reconciliation dashboard for finance operations with webhook retries, audit trails, and invoice matching.",
    status: "under_review",
    andishiNotes: "Needs payments depth and calm delivery cadence.",
    submittedAt: "2026-05-21T11:00:00.000Z",
  },
] as const;

export const demoMatches = [
  {
    id: demoIds.match,
    briefId: demoIds.brief,
    engineerId: demoIds.engineer,
    status: "client_reviewing",
    proposedAt: "2026-05-22T09:00:00.000Z",
    adminNotes: "Strong match on AI support workflow and evaluation tooling.",
    clientNotes: "Interested. Need intro slots for next week.",
    clientPreferredSlot1: "2026-05-28T10:00:00.000Z",
    clientPreferredSlot2: "2026-05-29T13:00:00.000Z",
  },
  {
    id: demoIds.matchTwo,
    briefId: demoIds.briefTwo,
    engineerId: demoIds.engineerTwo,
    status: "proposed",
    proposedAt: "2026-05-23T13:00:00.000Z",
    adminNotes: "Good fit for payments reconciliation and SaaS rebuild.",
  },
] as const;

export const demoPlacements = [
  {
    id: demoIds.placement,
    matchId: demoIds.match,
    engineerId: demoIds.engineer,
    organizationId: demoIds.organization,
    startDate: "2026-06-01",
    endDate: null,
    engagementModel: "embedded",
    status: "active",
    weeklyHours: 32,
    currency: "USD",
  },
] as const;

export const demoProjects = [
  {
    id: demoIds.project,
    briefId: demoIds.brief,
    placementId: demoIds.placement,
    organizationId: demoIds.organization,
    engineerIds: [demoIds.engineer],
    title: "AI support workflow",
    sourceBrief: "Senior AI engineer for customer support workflow",
    description: "RAG assistant, admin review queue, evaluation traces, and support escalation rules.",
    status: "active",
    startDate: "2026-06-01",
    targetDate: "2026-07-15",
    stackTags: ["Next.js", "Python", "OpenAI", "Postgres"],
    milestones: [
      {
        id: "ms-eval",
        title: "Evaluation dashboard",
        status: "in_progress",
        dueDate: "2026-06-14",
      },
      {
        id: "ms-review",
        title: "Human review queue",
        status: "pending",
        dueDate: "2026-06-28",
      },
    ],
  },
  {
    id: demoIds.projectTwo,
    briefId: demoIds.briefTwo,
    placementId: null,
    organizationId: demoIds.organization,
    engineerIds: [demoIds.engineerTwo],
    title: "Payments reconciliation",
    sourceBrief: "Full-stack engineer for payments reconciliation",
    description: "Webhook retry visibility, M-Pesa settlement matching, and finance audit exports.",
    status: "scoping",
    startDate: "2026-06-10",
    targetDate: "2026-08-01",
    stackTags: ["Node.js", "Postgres", "M-Pesa"],
    milestones: [
      {
        id: "ms-contracts",
        title: "Provider contract tests",
        status: "pending",
        dueDate: "2026-06-18",
      },
    ],
  },
] as const;

export const demoInvoices = [
  {
    id: demoIds.invoice,
    organizationId: demoIds.organization,
    engineerId: demoIds.engineer,
    projectId: demoIds.project,
    invoiceNumber: "AND-2026-0001",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    amountCents: 780000,
    currency: "USD",
    status: "sent",
    issuedAt: "2026-05-24T09:00:00.000Z",
    paidAt: null,
  },
] as const;

export const demoTimesheets = [
  {
    id: demoIds.timesheet,
    projectId: demoIds.project,
    engineerId: demoIds.engineer,
    date: "2026-05-25",
    minutes: 390,
    description: "Evaluation trace schema and dashboard handoff",
    billable: true,
    status: "submitted",
  },
] as const;

export const demoActivity = [
  {
    id: "12121212-1212-4121-8121-121212121212",
    type: "brief_submitted",
    actorId: demoIds.clientUser,
    actorRole: "client",
    organizationId: demoIds.organization,
    engineerId: null,
    entityType: "brief",
    entityId: demoIds.brief,
    description: "Kijani submitted an AI support workflow brief",
    visibleTo: ["admin", "client"],
    createdAt: "2026-05-24T08:00:00.000Z",
  },
  {
    id: "13131313-1313-4131-8131-131313131313",
    type: "match_proposed",
    actorId: demoIds.adminUser,
    actorRole: "admin",
    organizationId: demoIds.organization,
    engineerId: demoIds.engineer,
    entityType: "match",
    entityId: demoIds.match,
    description: "Amina was proposed as a strong AI match",
    visibleTo: ["admin", "client", "developer"],
    createdAt: "2026-05-24T10:00:00.000Z",
  },
  {
    id: "14141414-1414-4141-8141-141414141414",
    type: "timesheet_submitted",
    actorId: demoIds.developerUser,
    actorRole: "developer",
    organizationId: demoIds.organization,
    engineerId: demoIds.engineer,
    entityType: "project",
    entityId: demoIds.project,
    description: "Amina submitted 6.5 hours for evaluation dashboard work",
    visibleTo: ["admin", "client", "developer"],
    createdAt: "2026-05-25T15:30:00.000Z",
  },
] as const;

export const adminDashboardMock = {
  metrics: [
    {
      label: "Briefs in Pipeline",
      value: "12",
      trend: "2 need review today",
      data: [6, 7, 8, 8, 10, 11, 12],
    },
    {
      label: "Strong Matches",
      value: "8",
      trend: "4 client reviewing",
      data: [2, 3, 4, 5, 5, 7, 8],
    },
    {
      label: "Active Placements",
      value: "5",
      trend: "1 starts next week",
      data: [1, 2, 3, 3, 4, 5, 5],
    },
    {
      label: "Revenue in Flight",
      value: "$42k",
      trend: "$7.8k awaiting payment",
      data: [14, 18, 23, 25, 31, 36, 42],
    },
  ],
  pipeline: [
    {
      title: "New Briefs",
      count: 3,
      items: [
        {
          title: "AI workflow",
          meta: "Kijani Analytics",
          status: "Submitted",
          owner: "Ops review",
        },
        {
          title: "Backend API",
          meta: "Health SaaS",
          status: "Under Review",
          owner: "Dennis",
        },
      ],
    },
    {
      title: "Shortlisting",
      count: 4,
      items: [
        {
          title: "Payments reconciliation",
          meta: "Commerce scale-up",
          status: "Matching",
          owner: "Talent",
        },
        {
          title: "AWS migration",
          meta: "B2B SaaS",
          status: "Matching",
          owner: "Cloud bench",
        },
      ],
    },
    {
      title: "Client Review",
      count: 3,
      items: [
        {
          title: "Amina / AI support",
          meta: "Strong match",
          status: "Client Reviewing",
          owner: "Maya",
        },
      ],
    },
    {
      title: "Placed",
      count: 2,
      items: [
        {
          title: "AI support workflow",
          meta: "32 hrs/week",
          status: "Active",
          owner: "Amina",
        },
      ],
    },
  ],
  priorityBriefs: [
    {
      client: "Kijani Analytics",
      brief: "Senior AI engineer for customer support workflow",
      status: "Matching",
      sla: "5 days left",
      owner: "Dennis",
    },
    {
      client: "Commerce scale-up",
      brief: "Full-stack engineer for payments reconciliation",
      status: "Under Review",
      sla: "24h review",
      owner: "Talent",
    },
    {
      client: "Cloud audit",
      brief: "AWS platform engineer for migration review",
      status: "Submitted",
      sla: "Needs triage",
      owner: "Unassigned",
    },
  ],
  supplyHealth: [
    { label: "AI", available: 6, engaged: 3, soon: 2 },
    { label: "Full-stack", available: 9, engaged: 7, soon: 4 },
    { label: "Cloud/AWS", available: 4, engaged: 2, soon: 1 },
    { label: "Web3", available: 3, engaged: 1, soon: 2 },
  ],
  activity: [
    { time: "10m", label: "Amina was proposed as a strong match", detail: "AI support workflow" },
    { time: "1h", label: "Kijani submitted preferred intro slots", detail: "Client review" },
    { time: "3h", label: "Payments reconciliation brief moved to shortlisting", detail: "Ops" },
    { time: "Yesterday", label: "Invoice AND-2026-0001 issued", detail: "$7.8k" },
  ],
} as const;

export const dashboardDemoData = {
  activity: demoActivity,
  admin: adminDashboardMock,
  briefs: demoBriefs,
  engineers: demoEngineers,
  invoices: demoInvoices,
  matches: demoMatches,
  organizations: demoOrganizations,
  placements: demoPlacements,
  projects: demoProjects,
  timesheets: demoTimesheets,
  users: demoUsers,
} as const;
