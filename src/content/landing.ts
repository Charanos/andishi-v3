import {
  IconCircuitGroundDigital,
  IconDeviceDesktop,
  IconShoppingCart,
  IconWorldWww,
} from "@tabler/icons-react";

export const partners = ["M-Pesa", "Equity", "Twiga", "Bolt", "Jumia", "KCB", "Britam"];

export const heroStats = [
  ["11 days", "to a validated project brief"],
  ["3-8 weeks", "typical web app build"],
  ["30 days", "post-launch support included"],
];

export const services = [
  {
    title: "Web Applications",
    body: "Custom web apps for businesses that have outgrown spreadsheets and off-the-shelf tools.",
    timeline: "3-8 weeks",
    icon: IconDeviceDesktop,
  },
  {
    title: "E-Commerce & Retail Systems",
    body: "Online stores built for East African payments, inventory logic, and mobile-first buying.",
    timeline: "2-5 weeks",
    icon: IconShoppingCart,
  },
  {
    title: "Websites That Convert",
    body: "Landing pages and product pages designed around one goal: turning visitors into inquiries.",
    timeline: "1-3 weeks",
    icon: IconWorldWww,
  },
  {
    title: "Digital Systems & Integrations",
    body: "APIs, automations, and backend systems that connect your tools and save team hours.",
    timeline: "2-6 weeks",
    icon: IconCircuitGroundDigital,
  },
];

export const processSteps = [
  {
    step: "01",
    title: "One scoping call",
    body: "Tell us what you are building and why. We tell you what is realistic and whether we are the right fit.",
  },
  {
    step: "02",
    title: "We write the brief",
    body: "You get a one-page project brief with scope, timeline, deliverables, and cost.",
  },
  {
    step: "03",
    title: "Weekly visible progress",
    body: "You see working progress every week, with structured feedback rounds and clear scope calls.",
  },
  {
    step: "04",
    title: "A live product",
    body: "When we ship, the product is live, tested, documented, and supported for 30 days.",
  },
];

export const caseStudies = [
  {
    industry: "E-Commerce",
    location: "Nairobi",
    timeline: "5 weeks",
    title: "Inventory and order flow rebuilt around M-Pesa reality",
    problem: "Manual order management was costing six hours per staff member per week.",
    shipped: "A custom inventory and order system with payment reconciliation logic.",
    metric: "6hrs",
    context: "saved per staff member weekly",
    quote: "We went from chaos to a system that just runs.",
  },
  {
    industry: "Services",
    location: "Kenya",
    timeline: "18 days",
    title: "Conversion website for a founder-led consultancy",
    problem: "Strong referrals, weak online confidence, and no clear inquiry path.",
    shipped: "A high-trust landing system with lead capture and analytics.",
    metric: "2.4x",
    context: "more qualified inquiries",
    quote: "The site finally explains what we do without us being in the room.",
  },
  {
    industry: "Operations",
    location: "East Africa",
    timeline: "7 weeks",
    title: "Internal system connecting sales, approvals, and reporting",
    problem: "Team work was spread across chat, sheets, and disconnected approvals.",
    shipped: "A role-based workflow app with dashboards and weekly reporting.",
    metric: "41%",
    context: "faster approval cycle",
    quote: "Everyone knows where the work is now.",
  },
];

export const comparisonRows = [
  ["Scoping speed", "Days to weeks", "Weeks to months", "One call"],
  ["Accountability", "One person", "Account manager layer", "Founder-direct"],
  ["Timeline transparency", "Variable", "Milestone-gated", "Weekly progress"],
  ["Nairobi market knowledge", "Depends", "Often imported", "Built in"],
  ["Post-launch support", "Rare", "Retainer-only", "30 days included"],
  ["Project start time", "2-4 weeks", "4-8 weeks", "Within 5 business days"],
];

export const faqItems = [
  {
    q: "How long does a typical project take?",
    a: "Most web applications take 3-8 weeks from brief approval to launch. E-commerce builds take 2-5 weeks. Landing pages take 1-3 weeks.",
  },
  {
    q: "What does an Andishi project cost?",
    a: "Projects are scoped and priced individually. You get a fixed price before we start, usually within 48 hours of the scoping call.",
  },
  {
    q: "Do you work with businesses outside Nairobi?",
    a: "Yes. Most delivery runs remote with weekly calls, shared project boards, and documented feedback rounds for clients across East Africa.",
  },
  {
    q: "What happens after launch?",
    a: "Every project includes 30 days of post-launch support for bug fixes, adjustments, and technical questions.",
  },
  {
    q: "Do you build on WordPress, Shopify, or custom?",
    a: "We use the right tool for the job. If Shopify, WordPress, or a custom build is the better fit, we will tell you during scoping.",
  },
  {
    q: "What do you need from us to get started?",
    a: "A 30-minute call and clarity on what you are trying to solve. No brief, spec document, or wireframe needed.",
  },
];
