export const hireProcessSteps = [
  {
    name: "Submit a brief",
    text: "A 10-minute form covering the role, stack, timeline, engagement model, and what this engineer should own.",
  },
  {
    name: "We shortlist",
    text: "Andishi reviews the brief and hand-selects two to four engineers from the network. No algorithmic spray.",
  },
  {
    name: "You review profiles",
    text: "Profiles with assessments, past work, timezone, and rate context land in your workspace within eight days.",
  },
  {
    name: "Intro call",
    text: "A 30-minute video call with shortlisted engineer candidates. Technical depth, not a sales pitch.",
  },
  {
    name: "Onboard and ship",
    text: "Contract signed, access granted, first sprint scoped. Most teams have code committed in week one.",
  },
] as const;

export const hireGuarantees = [
  {
    value: "8 days",
    title: "Average to first profiles",
    body: "From brief submission to vetted profiles in your workspace, with context on why each engineer fits.",
  },
  {
    value: "5+ yrs",
    title: "Senior only",
    body: "Every engineer has demonstrable production experience and passes technical assessment before introduction.",
  },
  {
    value: "30 days",
    title: "Replacement guarantee",
    body: "If the engagement is not working inside the first month, we replace the engineer at no additional cost.",
  },
] as const;

export const engagementModels = [
  {
    title: "Project-based",
    body: "Scoped deliverable, fixed timeline. Best for MVPs, specific feature builds, and integration work.",
  },
  {
    title: "Embedded",
    body: "A senior engineer joins your team as a long-term collaborator inside your sprints, comms, and stack.",
  },
  {
    title: "Team extension",
    body: "Two to five engineers deployed together for scale-ups that need burst capacity on a defined workstream.",
  },
] as const;

export const hireFaqItems = [
  {
    q: "How quickly can we see matched engineers?",
    a: "Andishi usually responds within 24 hours after a hiring brief is submitted. The team then reviews the role, stack, seniority expectations, timezone needs, and engagement model before sending shortlisted profiles. The standard target is first profiles within eight days, with faster turnaround when a matching engineer is already active in the network.",
    category: "Process",
  },
  {
    q: "What happens after we submit a brief?",
    a: "After a brief is submitted, Andishi reviews the technical need and clarifies any gaps by email or a short call. The matching team then searches the active engineer network, checks availability, and prepares profiles with skills, assessment signals, timezone fit, and past work context. Qualified profiles are sent before any intro calls are scheduled.",
    category: "Process",
  },
  {
    q: "How does matching actually work?",
    a: "Matching is handled by people, not a marketplace algorithm. Andishi looks at the problem the engineer must own, the production stack, collaboration style, seniority requirement, timezone overlap, and engagement model. The shortlist is intentionally narrow so clients review a few credible options instead of filtering through a large pool of generic profiles.",
    category: "Process",
  },
  {
    q: "How are engineers vetted?",
    a: "Engineers are reviewed through production history, portfolio evidence, technical assessment, live code or architecture review, and reference checks where appropriate. The goal is to validate judgment, ownership, communication, and ability to work inside real systems. Andishi prioritizes engineers who have shipped production software, not candidates who only interview well.",
    category: "Quality",
  },
  {
    q: "What does senior mean at Andishi?",
    a: "Senior means the engineer can own a meaningful part of a product or system without heavy supervision. Andishi looks for at least five years of production experience, clear technical judgment, strong communication, and evidence of working through tradeoffs in real environments. The bar is practical ownership, not title inflation.",
    category: "Quality",
  },
  {
    q: "What is the acceptance rate for engineers?",
    a: "Andishi keeps the network selective and does not accept every applicant. Engineers need credible production experience, portfolio proof, communication strength, and successful assessment signals before they are introduced to clients. The exact acceptance rate may vary by hiring cycle and skill domain, but the network is intentionally curated rather than open marketplace inventory.",
    category: "Quality",
  },
  {
    q: "How are contracts structured?",
    a: "Engagements can be project-based, embedded, or team-extension contracts. Andishi helps clarify scope, start date, expected weekly capacity, communication cadence, and replacement terms before the engagement begins. The contract structure depends on the client need, but every placement is designed around clear ownership and practical onboarding.",
    category: "Engagement",
  },
  {
    q: "How does billing work?",
    a: "Billing is confirmed after the brief and shortlist because pricing depends on role seniority, specialization, duration, and engagement model. Project-based work is usually priced around a defined sprint or deliverable, while embedded and team-extension work is usually monthly. All ranges should be treated as indicative until scope is reviewed.",
    category: "Engagement",
  },
  {
    q: "Can we cancel an engagement?",
    a: "Yes. Cancellation terms are agreed before the engagement begins and depend on the model and contract length. Andishi aims to keep risk low by clarifying expectations early, checking in after placement, and offering a replacement guarantee in the first 30 days if the match is not working.",
    category: "Engagement",
  },
  {
    q: "What time zones do engineers work in?",
    a: "Andishi engineers are distributed across Africa, commonly from UTC+0 to UTC+3. That gives strong overlap with European teams and useful overlap with US East Coast teams. Timezone fit is considered during matching, especially for teams that rely on daily standups, pairing, incident response, or fast product feedback loops.",
    category: "Practical",
  },
  {
    q: "What tools do engineers work in?",
    a: "Engineers can work inside the client toolchain, including GitHub, Linear, Jira, Slack, Notion, Figma, CI systems, cloud dashboards, and existing deployment workflows. The expectation is that Andishi engineers join the way the client team already works, with onboarding support to reduce friction in the first sprint.",
    category: "Practical",
  },
  {
    q: "What if an engineer is not working out?",
    a: "Every placement includes a 30-day replacement guarantee. If the engagement is not working because of fit, communication, or technical mismatch, Andishi reviews the issue and replaces the engineer at no additional matching cost. The guarantee is designed to reduce buyer risk while still keeping expectations explicit from day one.",
    category: "Risk",
  },
  {
    q: "What skills and specialisms are covered?",
    a: "The network covers full-stack engineering, AI integration, cloud and AWS infrastructure, backend/API systems, Web3, blockchain, and mobile development. Specific stacks include React, Next.js, Node.js, Python, Go, PostgreSQL, AWS, Solidity, React Native, and LLM product workflows. Coverage depends on current engineer availability.",
    category: "Technical",
  },
] as const;

export const hireFaqTeaser = hireFaqItems.slice(0, 3);
