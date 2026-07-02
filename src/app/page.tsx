"use client";

import { useRef } from "react";
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
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const stats = [
    ["50+", "engineers placed"],
    ["8 days", "avg match speed"],
    ["30d", "replacement guarantee"],
  ];

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section className="relative isolate px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-28 bg-[color-mix(in_srgb,var(--bg-deep)_72%,var(--bg))]">
      <div className="mx-auto max-w-[92rem]">
        <div
          ref={containerRef}
          style={{ willChange: "transform, opacity" }}
          className="mx-auto max-w-4xl rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 max-sm:p-5 shadow-xl backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-300 max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0 max-md:hover:!bg-transparent"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/[0.02] via-transparent to-[var(--tertiary)]/[0.01] pointer-events-none rounded-xl max-md:hidden" />
          <div className="relative z-[1] grid gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="label-caps mb-4 text-[var(--tertiary)]">ALTERNATIVELY</p>
              <h3 className="title-serif text-[clamp(2rem,4vw,2.8rem)] font-normal leading-tight text-[var(--on-surface)]">
                Need to extend your engineering team instead?
              </h3>
              <p className="body-md mt-4 text-[var(--on-surface-dim)]">
                If you&apos;re not looking for a product partner but for a senior engineer to embed
                in your existing team - that&apos;s also something we do. We source, vet, and place
                senior engineers from across Africa with global teams who need to move fast without
                the recruiting overhead.
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
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-white/[0.05] pb-2 last:border-b-0"
                  >
                    <span className="text-[0.92rem] text-[var(--on-surface-dim)]">{label}</span>
                    <span className="font-mono text-[1.15rem] text-[var(--tertiary)] font-medium">
                      {value}
                    </span>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const founderStats = [
    ["32+", "Products shipped"],
    ["Founder-led", "Direct contact"],
    ["30 days", "Support guarantee"],
  ];

  const operatingRules = [
    "Scope directly on the first call.",
    "Build in transparent weekly sprints.",
    "Stand behind delivery outcomes.",
  ];

  useGSAP(
    () => {
      // Animate left side image & stats plate
      gsap.fromTo(
        ".founder-left-anim",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".founder-left-anim",
            start: "top 85%",
            once: true,
          },
        }
      );

      // Animate right side contents
      gsap.fromTo(
        ".founder-right-anim",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".founder-right-anim",
            start: "top 85%",
            once: true,
          },
        }
      );

      // Animate operating rules cards stagger
      gsap.fromTo(
        ".founder-rule-card",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".founder-rule-grid",
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative isolate overflow-hidden px-5 py-24 max-sm:py-16 sm:px-8 lg:px-10 lg:py-36 bg-[var(--bg)]">
      {/* Subtle top section border line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
      />

      {/* Decorative atmospheric halo */}
      <div className="absolute left-[30%] top-[40%] h-[35rem] w-[35rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--tertiary)_8%,transparent)] blur-[120px] pointer-events-none z-0" />

      <div className="relative z-[1] mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        {/* Left Column: Image Canvas & Stats */}
        <div className="order-2 lg:order-1 founder-left-anim" style={{ willChange: "transform, opacity" }}>
          <div className="relative mx-auto max-w-[28rem] lg:mx-0">
            {/* Elegant overlapping glass outlines */}
            <div
              aria-hidden="true"
              className="absolute -left-6 -top-6 h-28 w-40 rotate-[-6deg] rounded-[2.2rem] border border-[color-mix(in_srgb,var(--tertiary)_22%,transparent)] opacity-70 pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -right-6 h-36 w-56 rotate-[5deg] rounded-[2.2rem] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] opacity-70 pointer-events-none"
            />

            {/* Main Image glass container */}
            <div className="relative rounded-[2.2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 shadow-[0_32px_90px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] backdrop-blur-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem]">
                <Image
                  src="/images/ian.jpg"
                  alt="Ian Mwangi, founder of Andishi"
                  fill
                  sizes="(min-width: 1024px) 28rem, 88vw"
                  className="object-cover transition-transform duration-[4s] ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,#09090b_100%)] opacity-85" />
                <div className="absolute inset-x-0 bottom-8 p-6 z-20">
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-emerald-400 font-medium">
                    STUDIO OPERATOR
                  </p>
                  <p className="mt-2 text-[1.4rem] font-normal leading-tight text-white">
                    Built close to the client and the code.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Dashboard Plate */}
            <div className="relative z-[2] mx-4 -mt-12 sm:-mt-16 rounded-[1.5rem] soft-neumorphic-inner bg-[var(--surface)] border border-[var(--outline-variant)] dark:border-white/5 p-5 sm:mx-8 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)]">
              <div className="grid grid-cols-3 gap-4 divide-x divide-[var(--glass-border)]">
                {founderStats.map(([value, label], idx) => (
                  <div
                    key={label}
                    className={cn("flex flex-col justify-between", idx > 0 && "pl-4")}
                  >
                    <p className="font-mono text-[1.1rem] leading-none tracking-tight text-[var(--tertiary)] font-medium">
                      {value}
                    </p>
                    <p className="mt-2 text-[0.6rem] uppercase tracking-wider text-[var(--on-surface-dim)] leading-tight font-medium opacity-85">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Founder Copy */}
        <div className="order-1 lg:order-2 founder-right-anim" style={{ willChange: "transform, opacity" }}>
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)] font-medium tracking-[0.18em]">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            FOUNDER CONTEXT
          </p>
          <h2 className="title-serif max-w-[19ch] text-[clamp(2.1rem,5.6vw,4.55rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
            Built from Nairobi. Shipping for the world.
          </h2>
          <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)] leading-relaxed">
            Andishi was started because we kept seeing the same problem: founders with real
            ambition, stuck with digital partners who missed deadlines, padded budgets, or
            didn&apos;t understand what the product was actually for.
          </p>
          <p className="body-md mt-4 max-w-2xl text-[var(--on-surface-dim)] leading-relaxed">
            We build software for clients across Africa, Europe, and North America because delivery
            quality doesn&apos;t have an address. Our processes are structured, and every project
            has an owner who answers directly to you.
          </p>

          <blockquote className="title-serif italic mt-8 border-l-2 border-[var(--tertiary)] pl-5 text-[clamp(1.22rem,2.4vw,1.65rem)] font-normal leading-snug text-[var(--on-surface)]">
            “The quality of delivery is the only credential that matters.”
          </blockquote>

          {/* Operating Rules Bento Grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3 founder-rule-grid">
            {operatingRules.map((rule, index) => (
              <div
                key={rule}
                className="founder-rule-card relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.06)] backdrop-blur-md max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0 max-md:flex-row max-md:gap-4 max-md:items-start max-md:hover:translate-y-0"
                style={{ willChange: "transform, opacity" }}
              >
                {/* Floating backdrop rule number */}
                <span className="absolute -right-3 -bottom-8 font-serif text-[6.5rem] select-none pointer-events-none opacity-[0.035] text-[var(--on-surface-dim)] font-normal leading-none group-hover:scale-105">
                  0{index + 1}
                </span>

                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] mb-6 max-md:hidden shrink-0" />

                <p className="font-mono text-[0.66rem] tracking-[0.1em] text-[var(--on-surface-dim)] opacity-55 max-md:mt-0 max-md:pt-[3px] lg:hidden">
                  0{index + 1}
                </p>

                <p className="text-[0.92rem] font-medium leading-relaxed text-[var(--on-surface)] max-md:mt-0 max-md:mb-0 relative z-10">
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
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.96, y: 16 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: cardRef }
  );

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[var(--bg-deep)] px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-36"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-80">
        <Image
          src="/final-cta.svg"
          alt=""
          width={1580}
          height={900}
          loading="lazy"
          className="absolute left-1/2 top-1/2 h-auto w-[min(1580px,150vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.56] dark:opacity-[0.5]"
          style={{
            height: "auto",
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
        <div
          ref={cardRef}
          style={{ willChange: "transform, scale, opacity" }}
          className="mx-auto max-w-3xl rounded-[1.75rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_58%,transparent)] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-14 shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] backdrop-blur-2xl"
        >
          <p className="label-caps mb-4" style={{ color: "var(--tertiary)" }}>
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
          <p className="body-md mx-auto my-8 max-w-lg" style={{ color: "var(--on-surface-dim)" }}>
            Tell us what you&apos;re working on. We&apos;ll come back with a scope, timeline, and
            honest assessment of fit within one business day.
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
