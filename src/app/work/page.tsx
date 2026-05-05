import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { IconArrowRight, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Our Work — Andishi",
  description: "Case studies and delivered projects from Andishi — Nairobi's product studio.",
};

const projects = [
  {
    industry: "E-Commerce",
    location: "Nairobi",
    timeline: "5 weeks",
    title: "Inventory & order flow rebuilt around M-Pesa reality",
    problem: "Manual order management was costing six hours per staff member per week.",
    shipped: "A custom inventory and order system with payment reconciliation logic.",
    metric: "6hrs",
    context: "saved per staff member weekly",
    quote: "We went from chaos to a system that just runs.",
    color: "var(--secondary)",
    accent: "cyan" as const,
  },
  {
    industry: "Services",
    location: "Kenya",
    timeline: "18 days",
    title: "Conversion website for a founder-led consultancy",
    problem: "Strong referrals, weak online confidence, and no clear inquiry path.",
    shipped: "A high-trust landing system with lead capture and analytics.",
    metric: "2.4×",
    context: "more qualified inquiries",
    quote: "The site finally explains what we do without us being in the room.",
    color: "var(--primary)",
    accent: "violet" as const,
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
    color: "var(--tertiary)",
    accent: "amber" as const,
  },
];

export default function WorkPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Page hero */}
        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-40 sm:px-8">
          <div className="relative max-w-2xl">
            <p className="label-caps mb-4" style={{ color: "var(--tertiary)" }}>Recent work</p>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--on-surface)",
              }}
            >
              Signals from products<br />already in motion.
            </h1>
            <p className="body-lg mt-5 max-w-lg" style={{ color: "var(--on-surface-dim)" }}>
              Every project here was delivered on time, within scope, and is actively used by real people.
            </p>
          </div>
        </section>

        {/* Case studies */}
        <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
          <div className="flex flex-col gap-6">
            {projects.map((p, i) => (
              <GlassCard key={i} glow={p.accent} className="grid gap-10 md:grid-cols-[1.4fr_0.6fr] md:items-start">
                {/* Left */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-7">
                    <span
                      className="text-[10px] font-medium tracking-widest uppercase rounded-full px-3 py-1.5"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${p.color} 8%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${p.color} 20%, transparent)`,
                        color: p.color,
                      }}
                    >
                      {p.industry} · {p.location}
                    </span>
                    <span className="label-caps" style={{ color: "var(--on-surface-dim)", opacity: 0.5 }}>{p.timeline}</span>
                  </div>

                  <h2
                    className="mb-5"
                    style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 400, lineHeight: 1.3, letterSpacing: "-0.015em", color: "var(--on-surface)" }}
                  >
                    {p.title}
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="label-caps mb-2" style={{ color: p.color }}>The challenge</p>
                      <p className="body-md" style={{ color: "var(--on-surface-dim)" }}>{p.problem}</p>
                    </div>
                    <div>
                      <p className="label-caps mb-2" style={{ color: p.color }}>What we shipped</p>
                      <p className="body-md" style={{ color: "var(--on-surface-dim)" }}>{p.shipped}</p>
                    </div>
                  </div>
                </div>

                {/* Right — metric + quote */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${p.color} 5%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${p.color} 14%, transparent)`,
                  }}
                >
                  <p className="label-caps mb-1" style={{ color: p.color }}>The result</p>
                  <p
                    style={{
                      fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                      fontWeight: 300,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      color: p.color,
                      fontFamily: "var(--font-jetbrains, monospace)",
                    }}
                  >
                    {p.metric}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--on-surface-dim)" }}>{p.context}</p>

                  <blockquote
                    className="mt-5 text-sm italic leading-relaxed border-l-2 pl-4"
                    style={{
                      borderColor: `color-mix(in srgb, ${p.color} 35%, transparent)`,
                      color: "var(--on-surface)",
                    }}
                  >
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>

                  <Link
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: p.color }}
                  >
                    Discuss a similar project <IconExternalLink size={13} stroke={1.8} />
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-3xl px-6 pb-40 text-center sm:px-8">
          <h2
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.025em", color: "var(--on-surface)" }}
          >
            Got a project in mind?
          </h2>
          <p className="body-md mt-4 mx-auto max-w-md" style={{ color: "var(--on-surface-dim)" }}>
            Let&apos;s talk through what you&apos;re building and whether we&apos;re the right fit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-[3.35rem] items-center gap-2 rounded-full px-6 py-3.5 text-[0.98rem] font-medium text-white shadow-[var(--cta-shadow)] transition-all duration-200 hover:-translate-y-px"
              style={{ background: "var(--gradient-brand)" }}
            >
              Book a scoping call <IconArrowRight size={15} stroke={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
