import {
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import Image from "next/image";
import {
  caseStudies,
  comparisonRows,
  heroStats,
  partners,
  processSteps,
  services,
} from "@/content/landing";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FAQSection } from "@/components/sections/faq";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tooltip } from "@/components/ui/tooltip";
import { HeroSection } from "@/components/sections/hero-section";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does a typical project take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most web applications take 3-8 weeks from brief approval to launch. E-commerce builds take 2-5 weeks. Landing pages take 1-3 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work with businesses outside Nairobi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Andishi delivers for clients across Kenya and East Africa through remote weekly calls, shared project boards, and documented feedback rounds.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <HeroSection />
        <Services />
        <Process />
        <CaseStudies />
        <Comparison />
        <Founder />
        <FAQSection />
        <FinalCTA />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>
      <Footer />
    </>
  );
}


function Services() {
  return (
    <section
      id="services"
      className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:py-28"
    >
      <div className="mb-12">
        <p className="label-caps mb-3" style={{ color: "var(--secondary)" }}>
          What we build
        </p>
        <h2
          className="headline-lg max-w-xl"
          style={{ color: "var(--on-surface)" }}
        >
          A product studio, not a project factory.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <GlassCard key={service.title} glow="violet" bento>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--primary) 10%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--primary) 16%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={20} stroke={1.6} />
                </div>
                <span
                  className="text-[11px] font-medium tracking-wide rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--secondary) 8%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--secondary) 18%, transparent)",
                    color: "var(--secondary)",
                  }}
                >
                  {service.timeline}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 400,
                  color: "var(--on-surface)",
                }}
              >
                {service.title}
              </h3>
              <p
                className="body-md mt-3"
                style={{ color: "var(--on-surface-dim)" }}
              >
                {service.body}
              </p>
              <div
                className="mt-8 h-px"
                style={{
                  background:
                    "linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), transparent)",
                }}
              />
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      id="process"
      className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:py-28"
    >
      <div className="mb-12">
        <p className="label-caps mb-3" style={{ color: "var(--secondary)" }}>
          Our process
        </p>
        <h2
          className="headline-lg max-w-xl"
          style={{ color: "var(--on-surface)" }}
        >
          How a project with Andishi actually goes
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {processSteps.map((item) => (
          <GlassCard key={item.step} glow="cyan" bento>
            <span
              style={{
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: "2rem",
                fontWeight: 400,
                lineHeight: 1,
                color: "color-mix(in srgb, var(--secondary) 30%, transparent)",
              }}
            >
              {item.step}
            </span>
            <h3
              className="mt-5"
              style={{
                fontSize: "1rem",
                fontWeight: 400,
                color: "var(--on-surface)",
              }}
            >
              {item.title}
            </h3>
            <p
              className="body-md mt-3"
              style={{ color: "var(--on-surface-dim)" }}
            >
              {item.body}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Recent work"
        title="Signals from products already in motion"
        accent="tertiary"
        className="mb-10"
      />
      <div className="grid gap-4 lg:grid-cols-12">
        {caseStudies.map((study, index) => (
          <GlassCard
            key={study.title}
            glow="amber"
            className={
              index === 0
                ? "lg:col-span-7"
                : index === 1
                  ? "lg:col-span-5"
                  : "lg:col-span-12"
            }
          >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <span className="mono-sm rounded-full border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-1 text-[var(--secondary)]">
                {study.industry} / {study.location}
              </span>
              <span className="mono-sm text-[var(--outline)]">
                {study.timeline}
              </span>
            </div>
            <div
              className={
                index === 2 ? "grid gap-8 md:grid-cols-[1.1fr_0.9fr]" : ""
              }
            >
              <div>
                <h3 className="headline-md">{study.title}</h3>
                <p className="body-md mt-4 text-[var(--on-surface-dim)]">
                  {study.problem}
                </p>
                <p className="label-caps mt-7 text-[var(--primary)]">
                  What we shipped
                </p>
                <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                  {study.shipped}
                </p>
              </div>
              <div className="mt-8 md:mt-0">
                <p className="label-caps mb-3 text-[var(--tertiary)]">
                  The result
                </p>
                <Tooltip content={study.context}>
                  <span className="mono-stat text-[var(--tertiary)]">
                    {study.metric}
                  </span>
                </Tooltip>
                <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                  {study.context}
                </p>
                <blockquote className="body-md mt-6 border-l-2 border-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] pl-4 italic text-[var(--on-surface)]">
                  &quot;{study.quote}&quot;
                </blockquote>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] transition-all duration-300 hover:text-[var(--secondary)]"
                >
                  See the full case study
                  <IconExternalLink size={16} stroke={1.6} />
                </a>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section
      id="comparison"
      className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:py-28"
    >
      <div className="mb-12">
        <p className="label-caps mb-3" style={{ color: "var(--primary)" }}>
          Why Andishi
        </p>
        <h2
          className="headline-lg max-w-2xl"
          style={{ color: "var(--on-surface)" }}
        >
          Why founders choose us over a freelancer or agency
        </h2>
      </div>
      <GlassCard glow="violet" className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--surface-highest) 60%, transparent)",
              }}
            >
              {["Criteria", "Freelancer", "Big Agency", "Andishi"].map(
                (head, i) => (
                  <th
                    key={head}
                    className="px-6 py-4 text-left"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color:
                        i === 3 ? "var(--primary)" : "var(--on-surface-dim)",
                    }}
                  >
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr
                key={row[0]}
                className="transition-colors duration-200"
                style={{ borderTop: "1px solid var(--glass-border)" }}
              >
                {row.map((cell, index) => (
                  <td
                    key={cell}
                    className="px-6 py-3.5"
                    style={{
                      fontSize: "0.875rem",
                      color:
                        index === 3
                          ? "var(--primary)"
                          : index === 0
                            ? "var(--on-surface)"
                            : "var(--on-surface-dim)",
                      fontWeight: index === 0 ? 500 : 400,
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {index === 3 && (
                        <IconCircleCheck size={14} stroke={1.8} />
                      )}
                      {cell}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </section>
  );
}

function Founder() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
      <GlassCard
        glow="amber"
        className="grid gap-10 md:grid-cols-[260px_1fr] md:items-center"
      >
        <div
          className="relative aspect-square max-w-[260px] overflow-hidden rounded-2xl"
          style={{
            border:
              "1px solid color-mix(in srgb, var(--tertiary) 20%, transparent)",
          }}
        >
          <Image
            src="/images/dev1.jpg"
            alt="Andishi founder"
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="label-caps mb-4" style={{ color: "var(--tertiary)" }}>
            Founder
          </p>
          <blockquote
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 300,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: "var(--on-surface)",
            }}
          >
            Built in Nairobi. Thinking about what comes next.
          </blockquote>
          <p
            className="body-md mt-5 max-w-lg"
            style={{ color: "var(--on-surface-dim)" }}
          >
            Andishi exists for businesses with real ambition who need digital
            partners that understand the market, the deadline, and the stakes of
            shipping well.
          </p>
          <p className="label-caps mt-6" style={{ color: "var(--primary)" }}>
            Andishi Founder
          </p>
        </div>
      </GlassCard>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative px-6 py-24 text-center sm:px-8 lg:py-36"
    >
      <div className="relative mx-auto max-w-xl">
        <p className="label-caps mb-4" style={{ color: "var(--secondary)" }}>
          Start here
        </p>
        <h2
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--on-surface)",
          }}
        >
          Ready to scope your project?
        </h2>
        <p
          className="body-md mx-auto mt-5 max-w-md"
          style={{ color: "var(--on-surface-dim)" }}
        >
          The first call is 30 minutes and costs nothing. You will leave with a
          clear picture of what is possible and what it takes.
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
        <p
          className="label-caps mt-6"
          style={{ color: "var(--on-surface-dim)", opacity: 0.5 }}
        >
          No pitch · No retainer required · Response within 24 hours
        </p>
      </div>
    </section>
  );
}
