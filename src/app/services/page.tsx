import { GlassCard } from "@/components/ui/glass-card";
import {
  IconArrowRight,
  IconDeviceDesktop,
  IconShoppingCart,
  IconWorldWww,
  IconCircuitGroundDigital,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Services — Andishi",
  description: "Web applications, e-commerce, websites, and digital systems built for Kenyan and African businesses.",
};

const services = [
  {
    icon: IconDeviceDesktop,
    title: "Web Applications",
    description: "Custom web apps for businesses that have outgrown spreadsheets and off-the-shelf tools. We architect for performance, scale, and real-world edge cases.",
    timeline: "3–8 weeks",
    color: "var(--primary)",
    accent: "violet" as const,
    details: ["Role-based access control", "M-Pesa & payment integrations", "Custom dashboards & reports", "Mobile-responsive by default"],
  },
  {
    icon: IconShoppingCart,
    title: "E-Commerce & Retail Systems",
    description: "Online stores built for East African payments, inventory logic, and mobile-first buying. M-Pesa, card, and cash-on-delivery — handled.",
    timeline: "2–5 weeks",
    color: "var(--secondary)",
    accent: "cyan" as const,
    details: ["M-Pesa STK push integration", "Inventory & stock management", "Order tracking & fulfilment", "Multi-currency support"],
  },
  {
    icon: IconWorldWww,
    title: "Websites That Convert",
    description: "Landing pages and product pages designed around one goal: turning visitors into qualified leads. Built fast, tested rigorously, measured precisely.",
    timeline: "1–3 weeks",
    color: "var(--tertiary)",
    accent: "amber" as const,
    details: ["CRO-focused design", "Analytics & event tracking", "Lead capture integrations", "Sub-3s load times"],
  },
  {
    icon: IconCircuitGroundDigital,
    title: "Digital Systems & Integrations",
    description: "APIs, automations, and backend systems that connect your tools and eliminate manual work. Built to run silently in the background.",
    timeline: "2–6 weeks",
    color: "var(--primary)",
    accent: "violet" as const,
    details: ["REST & webhook APIs", "Automation pipelines", "Third-party integrations", "Background job queues"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <main className="relative overflow-hidden">
        {/* Page hero */}
        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-40 sm:px-8">
          <div className="relative max-w-2xl">
            <p className="label-caps mb-4" style={{ color: "var(--secondary)" }}>What we build</p>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--on-surface)",
              }}
            >
              A product studio,<br />not a project factory.
            </h1>
            <p className="body-lg mt-5 max-w-lg" style={{ color: "var(--on-surface-dim)" }}>
              Every engagement starts with understanding what you are trying to solve —
              not what you think you need built.
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <GlassCard key={s.title} glow={s.accent} bento>
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div
                      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
                        border: `1px solid color-mix(in srgb, ${s.color} 22%, transparent)`,
                        color: s.color,
                      }}
                    >
                      <Icon size={20} stroke={1.5} />
                    </div>
                    <span
                      className="text-[10px] font-medium tracking-widest uppercase rounded-full px-3 py-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${s.color} 8%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${s.color} 18%, transparent)`,
                        color: s.color,
                      }}
                    >
                      {s.timeline}
                    </span>
                  </div>

                  <h2
                    className="mb-3"
                    style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--on-surface)", letterSpacing: "-0.01em" }}
                  >
                    {s.title}
                  </h2>
                  <p className="body-md" style={{ color: "var(--on-surface-dim)" }}>{s.description}</p>

                  <ul className="mt-6 space-y-2">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--on-surface-dim)" }}>
                        <IconCircleCheck size={14} stroke={1.8} style={{ color: s.color, flexShrink: 0 }} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-8 h-px"
                    style={{ background: `linear-gradient(to right, color-mix(in srgb, ${s.color} 24%, transparent), transparent)` }}
                  />
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-3xl px-6 pb-40 text-center sm:px-8">
          <h2
            className="relative"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.025em", color: "var(--on-surface)" }}
          >
            Ready to scope your project?
          </h2>
          <p className="body-md mx-auto mt-4 max-w-md" style={{ color: "var(--on-surface-dim)" }}>
            The first call is 30 minutes and costs nothing. You&apos;ll leave with a clear scope, timeline, and price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-[3.35rem] items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-3.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-200 hover:-translate-y-px"
            >
              Book a scoping call <IconArrowRight size={15} stroke={2} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
