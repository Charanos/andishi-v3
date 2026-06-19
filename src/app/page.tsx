import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { BlogAndFaqNewsletter } from "@/components/sections/blog-faq-newsletter";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectShowcase } from "@/components/sections/project-showcase";
import { WhyAndishiSection } from "@/components/sections/why-andishi-section";
import { ServicesBentoGrid } from "@/components/sections/services-bento";
import { ProcessSection } from "@/components/sections/process-section";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What kinds of products do you build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Web applications, SaaS platforms, AI-powered tools, mobile apps (iOS and Android), enterprise internal tools, blockchain and Web3 products, APIs, and data integrations.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a typical project take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A scoped web app takes 4–10 weeks. A full SaaS product is typically 6–14 weeks from scoping to initial launch. Mobile apps run 6–12 weeks.",
      },
    },
  ],
};


const processTextureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--tertiary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

export default function Home() {
  return (
    <>
      <main className="relative overflow-hidden bg-[var(--bg)]">
        <HeroSection />
        <ServicesBentoGrid />
        <ProcessSection />
        <ProjectShowcase />
        <WhyAndishiSection />
        <TalentTrack />
        <Founder />
        <BlogAndFaqNewsletter />
        <FinalCTA />
      </main>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

function TalentTrack() {
  const stats = [
    ["50+", "engineers placed"],
    ["8 days", "avg match speed"],
    ["30d", "replacement guarantee"],
  ];

  return (
    <section className="relative isolate px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-28 bg-[color-mix(in_srgb,var(--bg-deep)_72%,var(--bg))]">
      <div className="mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 max-sm:p-5 shadow-xl backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-300 max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0 max-md:hover:!bg-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/[0.02] via-transparent to-[var(--tertiary)]/[0.01] pointer-events-none rounded-xl max-md:hidden" />
          <div className="relative z-[1] grid gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="label-caps mb-4 text-[var(--tertiary)]">ALTERNATIVELY</p>
              <h3 className="title-serif text-[clamp(2rem,4vw,2.8rem)] font-normal leading-tight text-[var(--on-surface)]">
                Need to extend your engineering team instead?
              </h3>
              <p className="body-md mt-4 text-[var(--on-surface-dim)]">
                If you&apos;re not looking for a product partner but for a senior engineer to embed in your existing team - that&apos;s also something we do. We source, vet, and place senior engineers from across Africa with global teams who need to move fast without the recruiting overhead.
              </p>
              <div className="mt-8">
                <Link
                  href="/hire"
                  className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-transparent bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] no-underline shadow-lg transition-all duration-300 hover:-translate-y-px"
                >
                  Hire a Senior Engineer
                  <IconArrowRight size={15} stroke={2} />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-white/[0.08] pt-6 md:border-l md:border-t-0 md:pt-0 md:pl-8">
              <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                Matching capability
              </p>
              <div className="space-y-4">
                {stats.map(([value, label]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/[0.05] pb-2 last:border-b-0">
                    <span className="text-[0.92rem] text-[var(--on-surface-dim)]">{label}</span>
                    <span className="font-mono text-[1.15rem] text-[var(--tertiary)] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founder() {
  const founderStats = [
    ["32+", "Products shipped"],
    ["Founder-led", "Direct accountability"],
    ["30 days", "Launch support guarantee"],
  ];

  const operatingRules = [
    "Scope directly on the first call.",
    "Build in transparent weekly sprints.",
    "Stand behind delivery outcomes.",
  ];

  return (
    <section className="relative isolate overflow-hidden px-5 py-24 max-sm:py-16 sm:px-8 lg:px-10 lg:py-32 bg-[var(--bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
      />

      <div className="relative z-[1] mx-auto grid max-w-[92rem] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-[28rem] lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute -left-5 -top-5 h-24 w-36 rotate-[-8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] opacity-60"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-7 -right-6 h-32 w-52 rotate-[7deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] opacity-60"
            />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_13%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)]">
              <Image
                src="/images/ian.jpg"
                alt="Andishi founder"
                fill
                sizes="(min-width: 1024px) 28rem, 88vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,color-mix(in_srgb,var(--bg-deep)_84%,transparent)_100%)]" />
              <div className="absolute inset-x-0 bottom-8 p-5 sm:p-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--on-surface-dim)]">
                  FOUNDER
                </p>
                <p className="mt-2 text-[1.3rem] font-medium leading-tight text-[var(--on-surface)]">
                  Built close to the client and the code.
                </p>
              </div>
            </div>

            <div className="relative z-[2] mx-4 -mt-10 rounded-[1.3rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-4 shadow-[0_20px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl sm:mx-8 max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0 max-md:mt-6">
              <div className="grid grid-cols-3 gap-2">
                {founderStats.map(([value, label]) => (
                  <div key={label}>
                    <p className="font-mono text-[0.78rem] leading-tight tracking-tight text-[var(--on-surface)]">
                      {value}
                    </p>
                    <p className="mt-1 text-[0.64rem] leading-snug text-[var(--on-surface-dim)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            FOUNDER
          </p>
          <h2 className="title-serif max-w-[19ch] text-[clamp(1.95rem,5.4vw,4.45rem)] font-normal leading-[0.94] tracking-tight text-foreground">
            Built from Nairobi. Shipping for the world.
          </h2>
          <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)] leading-relaxed">
            Andishi was started because we kept seeing the same problem: founders with real ambition, stuck with digital partners who missed deadlines, padded budgets, or didn&apos;t understand what the product was actually for.
          </p>
          <p className="body-md mt-4 max-w-2xl text-[var(--on-surface-dim)] leading-relaxed">
            We build software for clients across Africa, Europe, and North America because delivery quality doesn&apos;t have an address. Our processes are structured, and every project has an owner who answers directly to you.
          </p>

          <blockquote className="mt-8 border-l border-[color-mix(in_srgb,var(--tertiary)_38%,transparent)] pl-5 text-[clamp(1.15rem,2.2vw,1.55rem)] font-normal leading-snug text-foreground">
            “The quality of delivery is the only credential that matters.”
          </blockquote>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {operatingRules.map((rule, index) => (
              <div
                key={rule}
                className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-md max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0 max-md:flex-row max-md:gap-4 max-md:items-start max-md:hover:translate-y-0"
              >
                <p className="font-mono text-[0.68rem] tracking-[0.1em] text-[var(--on-surface-dim)] max-md:mt-0 max-md:pt-[3px] opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-8 mb-2 text-[0.95rem] font-medium leading-relaxed text-[var(--on-surface)] max-md:mt-0 max-md:mb-0">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[var(--bg-deep)] px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
      >
        <Image
          src="/final-cta.svg"
          alt=""
          width={1580}
          height={900}
          loading="lazy"
          className="absolute left-1/2 top-1/2 h-auto w-[min(1580px,150vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.56] dark:opacity-[0.5]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_68%,transparent)_22%,color-mix(in_srgb,var(--bg)_66%,transparent)_78%,var(--bg)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={processTextureStyle}
      />
      <div className="relative z-[1] mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_58%,transparent)] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-14 shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] backdrop-blur-2xl">
          <p
            className="label-caps mb-4"
            style={{ color: "var(--tertiary)" }}
          >
            Start here
          </p>
          <h2
            className="title-serif"
            style={{
              fontSize: "clamp(1.65rem, 3.5vw, 3.5rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.012em",
              color: "var(--on-surface)",
            }}
          >
            Ready to build something?
          </h2>
          <p
            className="body-md mx-auto my-8 max-w-lg"
            style={{ color: "var(--on-surface-dim)" }}
          >
            Tell us what you&apos;re working on. We&apos;ll come back with a scope, timeline, and honest assessment of fit within one business day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/start-project"
              className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-transparent bg-[var(--on-surface)] px-8 py-3 text-[15px] font-[500] text-[var(--bg)] no-underline shadow-lg transition-all duration-300 hover:-translate-y-px"
            >
              Start a Project
              <IconArrowRight size={16} stroke={1.8} />
            </Link>
            <Link
              href="/hire"
              className="inline-flex min-h-[2.4rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--surface-low)_32%,transparent)] px-7 py-3 text-[15px] font-[500] text-[var(--primary)] no-underline backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--tertiary)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
            >
              Or hire an engineer &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
