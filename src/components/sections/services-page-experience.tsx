"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconCreditCard,
  IconDeviceDesktop,
  IconInfoCircle,
  IconPlugConnected,
  IconShoppingCart,
  IconWorldWww,
} from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/button";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cn } from "@/lib/utils";

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

const capabilities = [
  "Next.js",
  "NestJS",
  "M-Pesa Daraja",
  "USDT rails",
  "TypeScript",
  "PostgreSQL",
  "MongoDB",
  "AWS Lambda",
  "Vercel",
  "WebSockets",
  "Mapbox GL",
  "React Native",
  "Figma to code",
  "Africa's Talking",
  "WhatsApp Business API",
  "Prisma ORM",
];

const services = [
  {
    id: "web-applications",
    number: "01",
    sector: "Web / Applications",
    title: "Web Application Development",
    shortTitle: "Web Applications",
    timeline: "3-8 wks",
    price: "KES 80k+",
    signal: "14+",
    signalLabel: "deployed",
    icon: IconDeviceDesktop,
    artifact: "kanban",
    accent: "var(--secondary)",
    description:
      "Custom web apps for teams that have outgrown spreadsheets, WhatsApp, and off-the-shelf tools. We build role-based, multi-tenant, production-ready systems around how your operation actually works.",
    deliverables: [
      "Full-stack web app with a stable architecture",
      "Role-based access and multi-tenant support",
      "Database design, API contracts, and documentation",
      "Production deployment with 30-day support",
    ],
    stack: [
      "Next.js",
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "MongoDB",
      "Vercel",
    ],
  },
  {
    id: "payments",
    number: "02",
    sector: "Fintech / Payments",
    title: "Payment Systems & Fintech",
    shortTitle: "Payment Systems",
    timeline: "2-5 wks",
    price: "KES 60k+",
    signal: "98.3%",
    signalLabel: "match rate",
    icon: IconCreditCard,
    artifact: "terminal",
    accent: "var(--tertiary)",
    description:
      "M-Pesa Daraja, Stripe, Airtel Money, USDT rails, callbacks, reconciliation, and transaction monitoring built with the kind of failure handling real money deserves.",
    deliverables: [
      "M-Pesa STK Push, C2B, B2C, and callback flows",
      "Real-time webhook and reconciliation system",
      "Admin transaction monitor and audit trail",
      "Payment failure states, retries, and support handoff",
    ],
    stack: [
      "M-Pesa Daraja",
      "USDT rails",
      "Stripe",
      "NestJS",
      "PostgreSQL",
      "Redis",
    ],
  },
  {
    id: "commerce",
    number: "03",
    sector: "Retail / Commerce",
    title: "E-Commerce & Retail Systems",
    shortTitle: "E-Commerce",
    timeline: "2-5 wks",
    price: "KES 55k+",
    signal: "+62%",
    signalLabel: "conv. lift",
    icon: IconShoppingCart,
    artifact: "schema",
    accent: "var(--secondary)",
    description:
      "Online stores built for East African payments, mobile-first buying, inventory reality, order operations, and the back-office clarity your team needs after launch.",
    deliverables: [
      "Mobile-first storefront with M-Pesa checkout",
      "Inventory management and order tracking",
      "Referral, affiliate, or influencer tracking",
      "Admin dashboard with sales and fulfilment analytics",
    ],
    stack: ["M-Pesa", "Next.js", "Prisma", "PostgreSQL", "Tailwind", "Vercel"],
  },
  {
    id: "conversion",
    number: "04",
    sector: "Conversion / Marketing",
    title: "Websites That Convert",
    shortTitle: "Conversion Sites",
    timeline: "1-3 wks",
    price: "KES 30k+",
    signal: "+85%",
    signalLabel: "lead lift",
    icon: IconWorldWww,
    artifact: "chat",
    accent: "var(--primary)",
    description:
      "Landing pages and product sites designed around one job: turning visitors into inquiries. Clear positioning, confident proof, clean CTA flow, and measurable performance.",
    deliverables: [
      "Conversion-focused landing page or full website",
      "SEO-ready structure and metadata",
      "Form, calendar, email, or WhatsApp CTA flow",
      "Analytics setup for events and inquiry quality",
    ],
    stack: ["Next.js", "Tailwind", "Framer Motion", "Vercel", "GA4"],
  },
  {
    id: "analytics",
    number: "05",
    sector: "Data / Intelligence",
    title: "Analytics & Dashboards",
    shortTitle: "Analytics",
    timeline: "2-6 wks",
    price: "KES 50k+",
    signal: "340+",
    signalLabel: "SMEs tracked",
    icon: IconChartBar,
    artifact: "chart",
    accent: "var(--tertiary)",
    description:
      "Business intelligence for revenue, inventory, fleet movement, customer cohorts, and operational health. We connect your sources and surface the metrics your team can act on.",
    deliverables: [
      "Real-time analytics dashboard",
      "Data pipeline connecting existing sources",
      "Automated weekly or monthly reports",
      "Alert system for thresholds and exceptions",
    ],
    stack: ["React", "Node.js", "PostgreSQL", "AWS Lambda", "SVG charts"],
  },
  {
    id: "integrations",
    number: "06",
    sector: "Systems / Integration",
    title: "APIs, Automations & Integrations",
    shortTitle: "Integrations",
    timeline: "2-6 wks",
    price: "KES 45k+",
    signal: "-62%",
    signalLabel: "manual ops",
    icon: IconPlugConnected,
    artifact: "map",
    accent: "var(--secondary)",
    description:
      "Backend systems that connect your tools, automate manual processes, and save your team hours every week across payments, messaging, CRM, validation, and reporting layers.",
    deliverables: [
      "REST or GraphQL API design and development",
      "Third-party integrations for payments, SMS, and WhatsApp",
      "Automated workflow pipelines and webhook handling",
      "API documentation and operational runbooks",
    ],
    stack: [
      "NestJS",
      "M-Pesa",
      "WhatsApp API",
      "Africa's Talking",
      "Redis",
      "AWS",
    ],
  },
];

const pricing = [
  {
    tier: "Starter",
    range: "KES 30-60k",
    label: "Landing pages, simple integrations, and single-feature workflows.",
    examples: [
      "Conversion landing page",
      "M-Pesa payment integration",
      "Simple automation or webhook",
    ],
  },
  {
    tier: "Growth",
    range: "KES 60-150k",
    label: "Full platforms, multi-feature apps, and operational systems.",
    examples: [
      "E-commerce platform",
      "Analytics dashboard",
      "Multi-tenant SaaS MVP",
    ],
    featured: true,
  },
  {
    tier: "Scale",
    range: "KES 150k+",
    label: "Complex services, marketplaces, and enterprise integrations.",
    examples: [
      "Microservice architecture",
      "Two-sided marketplace",
      "Multi-country deployment",
    ],
  },
];

export function ServicesPageExperience() {
  const [activeService, setActiveService] = useState(0);
  const active = services[activeService];
  const tickerItems = useMemo(() => [...capabilities, ...capabilities], []);
  const ActiveIcon = active.icon;

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[96rem] items-start gap-0 px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pt-36">
        <aside className="sticky top-28 hidden max-h-[calc(100svh-8rem)] w-72 shrink-0 flex-col justify-between self-start overflow-y-auto border-r border-[var(--glass-border)] pr-5 xl:flex">
          <div>
            <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              Service lines
            </p>
            <div className="border-y border-[var(--glass-border)]">
              {services.map((service, index) => {
                const selected = index === activeService;
                const Icon = service.icon;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveService(index)}
                    className={cn(
                      "group relative w-full overflow-hidden border-b border-[var(--glass-border)] py-4 pl-0 pr-3 text-left transition-all duration-300 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]",
                      selected &&
                        "bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-[var(--secondary)] transition-transform duration-300",
                        selected && "scale-y-100",
                      )}
                    />
                    <span className="flex items-start gap-3">
                      <span
                        className={cn(
                          "ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-300",
                          selected
                            ? "border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
                            : "border-transparent bg-transparent text-[var(--on-surface-dim)] group-hover:border-[var(--glass-border)] group-hover:bg-[var(--glass-bg)] group-hover:text-[var(--secondary)]",
                        )}
                      >
                        <Icon size={18} stroke={selected ? 2 : 1.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span
                            className={cn(
                              "text-[0.9rem] font-medium leading-snug",
                              selected
                                ? "text-[var(--on-surface)]"
                                : "text-[var(--on-surface-dim)] group-hover:text-[var(--on-surface)]",
                            )}
                          >
                            {service.shortTitle}
                          </span>
                          <span className="font-mono text-[0.66rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                            {service.number}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "label-caps mt-2 block text-[0.52rem] leading-tight",
                            selected
                              ? "text-[var(--secondary)]"
                              : "text-[color-mix(in_srgb,var(--on-surface-dim)_54%,transparent)]",
                          )}
                        >
                          {service.sector}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-3">
                          <span className="font-mono text-[0.66rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                            {service.timeline}
                          </span>
                          <span className="font-mono text-[0.66rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                            {service.price}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 xl:pl-10">
          <header className="mb-8 border-b border-[var(--glass-border)] pb-8 md:mb-10 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 180,
                mass: 0.8,
              }}
            >
              <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                <span className="h-px w-7 bg-[var(--secondary)]" />
                What we build
              </p>
              <h1 className="m-0 text-[clamp(3rem,11vw,6.2rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
                Our Services.
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 180,
                mass: 0.8,
                delay: 0.08,
              }}
              className="mt-6 max-w-md md:mt-0 md:text-right"
            >
              <p className="font-mono text-[clamp(3rem,7vw,5rem)] leading-none tracking-normal text-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] dark:text-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]">
                06
              </p>
              <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                Focused service lines for East African businesses that need real
                software: scoped precisely, shipped cleanly, and supported after
                launch.
              </p>
            </motion.div>
          </header>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {services.map((service, index) => {
              const selected = index === activeService;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveService(index)}
                  className="shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                  style={{
                    backgroundColor: selected
                      ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                      : "var(--glass-bg)",
                    borderColor: selected
                      ? "color-mix(in srgb, var(--primary) 34%, transparent)"
                      : "var(--glass-border)",
                    color: selected
                      ? "var(--primary)"
                      : "var(--on-surface-dim)",
                  }}
                >
                  {service.shortTitle}
                </button>
              );
            })}
          </div>

          <section className="relative mb-10 overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] py-3 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-20 bg-[linear-gradient(to_right,var(--bg),transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-20 bg-[linear-gradient(to_left,var(--bg),transparent)]" />
            <div className="services-ticker-track flex w-max items-center">
              {tickerItems.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="flex items-center gap-3 px-5 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)] transition-colors duration-300 hover:text-[var(--secondary)]"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      index % 2 === 0
                        ? "bg-[var(--secondary)]"
                        : "bg-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]",
                    )}
                  />
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-10 border-y border-[var(--glass-border)] py-10 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,26rem)] lg:gap-8">
            <motion.article
              key={`${active.id}-dossier`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 190 }}
              className="relative min-w-0"
            >
              <div
                aria-hidden="true"
                className="absolute bottom-6 right-6 hidden h-28 w-44 opacity-[0.08] lg:block"
                style={textureStyle}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-6 hidden h-28 w-44 rotate-6 rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_14%,transparent)] opacity-35 lg:block"
              />
              <div className="relative">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
                      <span className="font-mono tracking-normal">
                        {active.number}
                      </span>
                      {active.sector}
                    </p>
                    <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
                      {active.title}
                    </h2>
                    <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)]">
                      {active.description}
                    </p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
                    <ActiveIcon size={22} stroke={1.8} />
                  </span>
                </div>

                <Artifact type={active.artifact} />

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.72fr]">
                  <div>
                    <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      Deliverables
                    </p>
                    <div className="border-y border-[var(--glass-border)]">
                      {active.deliverables.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 border-b border-[var(--glass-border)] py-3 text-[0.9rem] leading-snug text-[var(--on-surface-dim)] last:border-b-0"
                        >
                          <IconCheck
                            size={15}
                            stroke={2.2}
                            className="shrink-0 text-[var(--tertiary)]"
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {active.stack.map((item, index) => (
                        <span
                          key={item}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-[0.74rem] font-medium text-[var(--on-surface-dim)]",
                            index === 0
                              ? "border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)]",
                          )}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: "spring", damping: 28, stiffness: 190 }}
                  className="space-y-6 border-t border-[var(--glass-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
                >
                  <div>
                    <div className="border-b border-[var(--glass-border)] pb-4">
                      <p className="label-caps text-[var(--secondary)]">
                        Scope snapshot
                      </p>
                      <p className="mt-2 text-[0.94rem] leading-snug text-[var(--on-surface)]">
                        {active.shortTitle}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 border-b border-[var(--glass-border)]">
                      {[
                        [active.timeline, "Timeline", "var(--secondary)"],
                        [active.price, "Starting from", "var(--on-surface)"],
                        [active.signal, active.signalLabel, "var(--tertiary)"],
                      ].map(([value, label, color]) => (
                        <div
                          key={label}
                          className="border-r border-[var(--glass-border)] py-4 pr-3 last:border-r-0"
                        >
                          <p
                            className="font-mono text-[0.86rem] leading-tight tracking-normal sm:text-[1rem]"
                            style={{ color }}
                          >
                            {value}
                          </p>
                          <p className="label-caps mt-2 text-[0.54rem] leading-tight text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      Best first step
                    </p>
                    <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                      Bring the business problem, current workflow, target
                      users, and one success metric. We will turn that into
                      scope, timeline, and a fixed quote.
                    </p>
                  </div>

                  <LinkButton
                    href="/contact"
                    variant="primary"
                    className="w-full"
                  >
                    Scope this service
                    <IconArrowRight size={16} stroke={1.8} />
                  </LinkButton>
                </motion.div>
              </AnimatePresence>
            </aside>
          </section>

          <section className="mt-16 border-t border-[var(--glass-border)] pt-12 lg:mt-20 lg:pt-16">
            <div className="mb-8 max-w-2xl">
              <p className="label-caps mb-4 text-[var(--secondary)]">
                Transparent pricing
              </p>
              <h2 className="max-w-[13ch] text-[clamp(2rem,7vw,4.4rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
                Know what you are getting into.
              </h2>
              <p className="body-md mt-5 text-[var(--on-surface-dim)]">
                Fixed-scope quotes only. What we scope is what you pay: no
                surprise invoices, no mystery retainers, no vague handoff.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pricing.map((item) => (
                <article
                  key={item.tier}
                  className={cn(
                    "relative overflow-hidden rounded-[1.35rem] border p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6",
                    item.featured
                      ? "border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)]"
                      : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)]",
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="absolute bottom-4 right-4 h-20 w-28 opacity-[0.08]"
                    style={textureStyle}
                  />
                  <div className="relative">
                    <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      {item.tier}
                    </p>
                    <p className="mt-4 font-mono text-[1.6rem] leading-none tracking-normal text-[var(--on-surface)]">
                      {item.range}
                    </p>
                    <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                      {item.label}
                    </p>
                    <div className="mt-6 grid gap-2">
                      {item.examples.map((example) => (
                        <p
                          key={example}
                          className="flex items-center gap-2 text-[0.78rem] text-[var(--on-surface-dim)]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--on-surface)_18%,transparent)]" />
                          {example}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex gap-4 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
                <IconInfoCircle size={19} stroke={1.6} />
              </span>
              <p className="body-md text-[var(--on-surface-dim)]">
                <span className="font-medium text-[var(--on-surface)]">
                  Pricing philosophy:
                </span>{" "}
                We quote accurately after a scoping call. If the fixed scope
                misses something we should have caught, that is ours to resolve.
              </p>
            </div>
          </section>

          <section className="relative mt-20 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:mt-24 lg:px-16 lg:py-16">
            <FinalCtaArtwork />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]"
              style={textureStyle}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 left-8 h-28 w-44 rotate-[-8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] opacity-40"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 top-8 h-32 w-52 rotate-[8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] opacity-35"
            />
            <div className="relative z-[1] mx-auto max-w-2xl">
              <p className="label-caps mb-4 text-[var(--secondary)]">
                Start here
              </p>
              <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.04] tracking-normal text-[var(--on-surface)]">
                Ready to scope your project?
              </h2>
              <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                The first call is 30 minutes and costs nothing. You will leave
                with a clear picture of what is possible and what it takes.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <LinkButton href="/contact" variant="primary">
                  Book a scoping call
                  <IconArrowRight size={16} stroke={1.8} />
                </LinkButton>
                <LinkButton href="mailto:hello@andishi.dev" variant="glass">
                  hello@andishi.dev
                </LinkButton>
              </div>
              <p className="label-caps mt-6 text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]">
                No pitch / No retainer required / Response within 24 hours
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Artifact({ type }: { type: string }) {
  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)]">
      <div className="flex h-8 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
        <span className="ml-auto font-mono text-[0.56rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
          {artifactRoute(type)}
        </span>
      </div>
      <div className="p-4">
        {type === "terminal" && <TerminalArtifact />}
        {type === "chat" && <ChatArtifact />}
        {type === "schema" && <SchemaArtifact />}
        {type === "chart" && <ChartArtifact />}
        {type === "map" && <MapArtifact />}
        {type === "kanban" && <KanbanArtifact />}
      </div>
    </div>
  );
}

function artifactRoute(type: string) {
  const routes: Record<string, string> = {
    kanban: "sprint-board / myschool",
    terminal: "payments-api / reconcile",
    schema: "schema / duka-commerce",
    chat: "scoping-call / conversion",
    chart: "analytics / ripoti",
    map: "integration-map / crm",
  };

  return routes[type] ?? "service-artifact";
}

function KanbanArtifact() {
  const columns = [
    [
      "Backlog",
      [
        ["Auth", "Role-based login"],
        ["DB", "Multi-tenant schema"],
      ],
    ],
    [
      "In progress",
      [
        ["UI", "Teacher portal"],
        ["API", "Fee endpoint"],
      ],
    ],
    [
      "Done",
      [
        ["QA", "CI pipeline"],
        ["Tokens", "Theme system"],
      ],
    ],
  ] as const;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {columns.map(([label, cards]) => (
        <div key={label}>
          <p className="label-caps mb-2 text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
            {label}
          </p>
          <div className="grid gap-1.5">
            {cards.map(([tag, text]) => (
              <div
                key={text}
                className="rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] p-2 text-[0.68rem] leading-snug text-[var(--on-surface-dim)]"
              >
                <span className="mb-1 inline-flex rounded-md bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-1.5 py-0.5 text-[0.55rem] font-medium text-[var(--secondary)]">
                  {tag}
                </span>
                <br />
                {text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TerminalArtifact() {
  return (
    <div className="rounded-xl bg-[#171223] p-4 font-mono text-[0.68rem] leading-relaxed tracking-normal text-white/58">
      <p>
        <span className="text-[var(--secondary)]">$</span> mpesa stk-push
        --env=prod
      </p>
      <p className="text-white/34">Initiating checkout to +254712...</p>
      <p className="text-[var(--tertiary)]">
        callback received / ResultCode: 0
      </p>
      <p className="text-[var(--tertiary)]">confirmed / KES 4,500.00</p>
      <p className="mt-3">
        <span className="text-[var(--secondary)]">$</span> reconcile
        --date=today
      </p>
      <p className="text-[var(--tertiary)]">
        247 txns / 98.3% matched / KES 2.4M
      </p>
    </div>
  );
}

function SchemaArtifact() {
  const rows = [
    ["model", "Product", "sku, price, inventory, images"],
    ["model", "Order", "items, total, mpesa_ref, status"],
    ["model", "Customer", "phone, referral_code, orders"],
    ["model", "Influencer", "code, commission_rate, payouts"],
  ];

  return (
    <div className="grid gap-2">
      {rows.map(([type, key, value]) => (
        <div
          key={key}
          className="flex min-w-0 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2 text-[0.68rem] text-[var(--on-surface-dim)]"
        >
          <span className="rounded-md bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-2 py-0.5 font-mono text-[0.58rem] tracking-normal text-[var(--secondary)]">
            {type}
          </span>
          <span className="font-mono text-[0.62rem] tracking-normal text-[var(--primary)]">
            {key}
          </span>
          <IconArrowRight
            size={12}
            stroke={1.6}
            className="shrink-0 text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]"
          />
          <span className="truncate">{value}</span>
        </div>
      ))}
    </div>
  );
}

function ChatArtifact() {
  return (
    <div className="grid gap-2">
      <div className="flex max-w-[92%] gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-2 text-[0.72rem] leading-snug text-[var(--on-surface)]">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--secondary)] font-mono text-[0.55rem] text-[var(--bg)]">
          A
        </span>
        Who is the decision-maker landing here?
      </div>
      <div className="ml-auto max-w-[86%] rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2 text-[0.72rem] leading-snug text-[var(--on-surface-dim)]">
        CFO at a Kenyan SME. We want demo bookings.
      </div>
      <div className="flex max-w-[92%] gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] px-3 py-2 text-[0.72rem] leading-snug text-[var(--on-surface-dim)]">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] font-mono text-[0.55rem] text-[var(--on-surface)]">
          C
        </span>
        Single CTA, proof-heavy, no jargon.
      </div>
    </div>
  );
}

function ChartArtifact() {
  const heights = ["40%", "62%", "48%", "75%", "55%", "88%", "95%"];

  return (
    <div>
      <p className="label-caps mb-3 text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
        Revenue / last 7 days
      </p>
      <div className="flex h-16 items-end gap-1.5">
        {heights.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="flex-1 rounded-t bg-[linear-gradient(to_top,var(--primary),var(--secondary))] opacity-75 transition-opacity duration-300 hover:opacity-100"
            style={{ height }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] p-3">
          <p className="font-mono text-[0.9rem] tracking-normal text-[var(--tertiary)]">
            KES 84.2k
          </p>
          <p className="label-caps mt-1 text-[0.52rem] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
            This week
          </p>
        </div>
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] p-3">
          <p className="font-mono text-[0.9rem] tracking-normal text-[var(--secondary)]">
            +34%
          </p>
          <p className="label-caps mt-1 text-[0.52rem] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
            vs last week
          </p>
        </div>
      </div>
    </div>
  );
}

function MapArtifact() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center">
        <MapNode label="WhatsApp API" />
        <MapLine />
        <MapNode label="Andishi Hub" active />
        <MapLine />
        <MapNode label="CRM" />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {["M-Pesa", "SMS", "KRA PIN", "Reports"].map((label) => (
          <MapNode key={label} label={label} />
        ))}
      </div>
    </div>
  );
}

function MapNode({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg border px-2.5 py-1.5 text-[0.66rem] font-medium",
        active
          ? "border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
          : "border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] text-[var(--on-surface-dim)]",
      )}
    >
      {label}
    </span>
  );
}

function MapLine() {
  return (
    <span className="h-px min-w-5 flex-1 bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]" />
  );
}
