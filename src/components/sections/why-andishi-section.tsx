"use client";

import {
  IconArrowRight,
  IconBolt,
  IconChartLine,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconDeviceMobile,
  IconLink,
  IconLock,
  IconMessageCircle,
  IconPlus,
  IconRocket,
  IconShieldCheck,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

const reasons = [
  {
    pretitle: "The speed problem",
    title: "We ship in days, not quarters.",
    body: "The average agency delivery loop drifts into months. We keep the team small, the brief sharp, and the path to launch visible from day one.",
    label: "delivery.metric",
    accent: "var(--secondary)",
    proofs: [
      ["Avg 11 day delivery", IconBolt],
      ["One scoping call", IconCircleCheck],
      ["Launch-ready handoff", IconRocket],
    ],
  },
  {
    pretitle: "The scope problem",
    title: "Scope creep ends at the brief.",
    body: "Features, integrations, edge cases, timeline, and cost are resolved before build. What we quote is what the project is designed to deliver.",
    label: "scope.clarity",
    accent: "var(--primary)",
    proofs: [
      ["Fixed-scope contracts", IconLock],
      ["Shared decisions", IconMessageCircle],
      ["No surprise invoices", IconShieldCheck],
    ],
  },
  {
    pretitle: "The ROI problem",
    title: "We measure success by what changes.",
    body: "The point is not another pretty interface. Every engagement is tied to movement: more qualified leads, fewer failed payments, and less manual work.",
    label: "roi.metrics",
    accent: "var(--tertiary)",
    proofs: [
      ["Lead quality lift", IconChartLine],
      ["Payment reliability", IconCreditCard],
      ["Less manual ops", IconClock],
    ],
  },
  {
    pretitle: "The communication problem",
    title: "You always know exactly where things stand.",
    body: "Daily async updates, a shared project board, and staging links mean there is no chasing, no mystery, and no waiting for a reveal.",
    label: "communication.log",
    accent: "var(--secondary)",
    proofs: [
      ["Daily updates", IconMessageCircle],
      ["Staging links", IconLink],
      ["30-day support", IconShieldCheck],
    ],
  },
  {
    pretitle: "The context problem",
    title: "We build for Africa, not just the internet.",
    body: "M-Pesa Daraja, USDT rails, NEMIS IDs, low-bandwidth mobile patterns, and East African workflows are already part of the design conversation.",
    label: "ea.stack",
    accent: "var(--primary)",
    proofs: [
      ["East Africa context", IconWorld],
      ["M-Pesa native", IconCreditCard],
      ["Mobile-first", IconDeviceMobile],
    ],
  },
];

function WindowChrome({ label }: { label: string }) {
  return (
    <div className="flex h-10 items-center gap-2 border-b border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_50%,transparent)] px-4">
      <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
      <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
      <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
      <span className="ml-auto font-mono text-[0.62rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_42%,transparent)]">
        {label}
      </span>
    </div>
  );
}

function SpeedGauge() {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center p-6">
      <p className="label-caps mb-5 text-center text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
        Avg time / brief to live product
      </p>
      <div className="relative mx-auto flex h-28 w-48 items-end justify-center">
        <svg
          viewBox="0 0 192 112"
          fill="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M20 92 A76 76 0 0 1 172 92"
            stroke="color-mix(in srgb, var(--on-surface) 8%, transparent)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M20 92 A76 76 0 0 1 74 24"
            stroke="var(--secondary)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M166 34 L154 46"
            stroke="color-mix(in srgb, var(--tertiary) 74%, transparent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="relative z-[1] font-mono text-[2.4rem] leading-none tracking-normal text-[var(--on-surface)]">
          11<span className="text-[1rem] text-[var(--secondary)]">d</span>
        </p>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[
          ["Andishi", "11 days", "var(--secondary)"],
          ["Typical route", "60-90 days", "var(--tertiary)"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_28%,transparent)] p-4"
          >
            <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
              {label}
            </p>
            <p
              className="font-mono text-[1.05rem] tracking-normal"
              style={{ color }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScopeBars({ active }: { active: boolean }) {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center p-6">
      <p className="label-caps mb-6 text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
        Scope clarity / first call to delivery
      </p>
      <div className="space-y-5">
        {[
          ["Typical agency", "28%", "var(--tertiary)", "28%"],
          ["Freelancer", "45%", "color-mix(in srgb, var(--tertiary) 58%, transparent)", "45%"],
          ["Andishi", "96%", "var(--secondary)", "96%"],
        ].map(([label, value, color, width]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-[0.78rem] text-[var(--on-surface-dim)]">
                {label}
              </p>
              <p className="font-mono text-[0.72rem] tracking-normal" style={{ color }}>
                {value}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: active ? width : "0%",
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[0.76rem] text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
        Scope creep is designed out before build starts.
      </p>
    </div>
  );
}

function MetricLifts() {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center gap-3 p-6">
      <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
        What changes after launch
      </p>
      {[
        ["Qualified leads", "+85%", "avg lift", "var(--tertiary)"],
        ["Payment success rate", "+34%", "avg lift", "var(--tertiary)"],
        ["Manual ops time", "-62%", "avg reduction", "var(--secondary)"],
      ].map(([name, value, delta, color]) => (
        <div
          key={name}
          className="flex items-center justify-between gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_28%,transparent)] p-4 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)]"
        >
          <p className="text-[0.82rem] text-[var(--on-surface-dim)]">{name}</p>
          <div className="text-right">
            <p className="font-mono text-[1.12rem] tracking-normal" style={{ color }}>
              {value}
            </p>
            <p className="mt-1 text-[0.66rem] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
              {delta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunicationThread() {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center gap-4 p-6">
      {[
        ["C", "Scoping call done. Brief locked, timeline confirmed: 14 days to launch.", "Day 0 / 10:32"],
        ["A", "Staging is up. Review the flow and send feedback before Friday.", "Day 7 / 15:14"],
      ].map(([initial, message, time], index) => (
        <div key={time} className="flex gap-3">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-[0.68rem] text-[var(--bg)]"
            style={{
              background:
                index === 0
                  ? "var(--secondary)"
                  : "color-mix(in srgb, var(--tertiary) 86%, var(--secondary))",
            }}
          >
            {initial}
          </span>
          <div>
            <p className="rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_28%,transparent)] px-4 py-3 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">
              {message}
            </p>
            <p className="mt-2 font-mono text-[0.58rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_48%,transparent)]">
              {time}
            </p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]" />
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]">
          Day 14
        </span>
        <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]" />
      </div>
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-4 py-2 text-[0.78rem] font-medium text-[var(--tertiary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Live / lipa.andishi.co.ke
        </span>
      </div>
    </div>
  );
}

function StackMap() {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center gap-4 p-6">
      {[
        ["Payments", ["M-Pesa Daraja", "USDT Rails", "Equity", "Airtel Money"]],
        ["Compliance and IDs", ["NEMIS", "KRA PIN", "NHIF/NSSF", "Safaricom BizConnect"]],
        ["Core tech", ["Next.js", "NestJS", "AWS", "Vercel"]],
      ].map(([label, chips]) => (
        <div key={label as string}>
          <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
            {label as string}
          </p>
          <div className="flex flex-wrap gap-2">
            {(chips as string[]).map((chip, index) => (
              <span
                key={chip}
                className="rounded-xl border px-3 py-1.5 text-[0.72rem] font-medium"
                style={{
                  backgroundColor:
                    index < 2
                      ? "color-mix(in srgb, var(--secondary) 9%, transparent)"
                      : "color-mix(in srgb, var(--bg-deep) 24%, transparent)",
                  borderColor:
                    index < 2
                      ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
                      : "color-mix(in srgb, var(--on-surface) 10%, transparent)",
                  color:
                    index < 2 ? "var(--secondary)" : "var(--on-surface-dim)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VisualPanel({ activeIndex }: { activeIndex: number }) {
  const panels = [
    <SpeedGauge key="speed" />,
    <ScopeBars key="scope" active={activeIndex === 1} />,
    <MetricLifts key="metrics" />,
    <CommunicationThread key="thread" />,
    <StackMap key="stack" />,
  ];

  return (
    <div className="relative min-h-[18rem]">
      {panels.map((panel, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-all duration-500"
          style={{
            opacity: activeIndex === index ? 1 : 0,
            transform:
              activeIndex === index ? "translateY(0)" : "translateY(14px)",
            pointerEvents: activeIndex === index ? "auto" : "none",
          }}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

export function WhyAndishiSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeReason = reasons[activeIndex];

  const borderColor = useMemo(
    () => `color-mix(in srgb, ${activeReason.accent} 24%, transparent)`,
    [activeReason.accent],
  );

  return (
    <section
      id="comparison"
      className="relative isolate bg-[color-mix(in_srgb,var(--bg-deep)_46%,var(--bg))] px-5 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.1]"
        style={textureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_16%,transparent),transparent)]"
      />

      <CustomCursorRegion className="relative z-[1] mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)] lg:justify-end">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Why Andishi
          </p>
          <h2 className="max-w-[13ch] text-[clamp(2.5rem,7vw,4.8rem)] font-normal leading-[0.96] tracking-normal text-[var(--on-surface)] lg:ml-auto lg:text-right">
            Not just another agency story.
          </h2>
          <p className="body-md mt-6 max-w-xl text-[var(--on-surface-dim)] lg:ml-auto lg:text-right">
            We built Andishi because Kenyan and East African teams deserve a
            partner that understands the deadline, the market, and the cost of
            vague delivery.
          </p>

          <div
            className="mt-10 overflow-hidden rounded-[1.45rem] border bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_34%,transparent)] backdrop-blur-2xl"
            style={{ borderColor }}
          >
            <WindowChrome label={activeReason.label} />
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={textureStyle}
              />
              <VisualPanel activeIndex={activeIndex} />
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-1">
          <div className="divide-y divide-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
            {reasons.map((reason, index) => {
              const isOpen = activeIndex === index;
              const Icon = isOpen ? IconPlus : IconPlus;

              return (
                <article key={reason.title}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group flex w-full items-center gap-4 py-6 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_44%,transparent)] sm:gap-6"
                    aria-expanded={isOpen}
                  >
                    <span className="font-mono text-[0.72rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_42%,transparent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="label-caps mb-2 block overflow-hidden transition-all duration-300"
                        style={{
                          color: "color-mix(in srgb, var(--on-surface-dim) 58%, transparent)",
                          maxHeight: isOpen ? 20 : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                      >
                        {reason.pretitle}
                      </span>
                      <span
                        className="block text-[clamp(1.15rem,2.2vw,1.45rem)] font-medium leading-tight transition-colors duration-300"
                        style={{
                          color: isOpen ? reason.accent : "var(--on-surface)",
                        }}
                      >
                        {reason.title}
                      </span>
                    </span>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300"
                      style={{
                        borderColor: isOpen
                          ? `color-mix(in srgb, ${reason.accent} 28%, transparent)`
                          : "var(--glass-border)",
                        backgroundColor: isOpen
                          ? `color-mix(in srgb, ${reason.accent} 10%, transparent)`
                          : "var(--glass-bg)",
                        color: isOpen
                          ? reason.accent
                          : "color-mix(in srgb, var(--on-surface-dim) 62%, transparent)",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <Icon size={15} stroke={1.7} />
                    </span>
                  </button>

                  <div
                    className="overflow-hidden pl-10 transition-all duration-500 sm:pl-[4.35rem]"
                    style={{
                      maxHeight: isOpen ? 260 : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p className="max-w-2xl text-[0.92rem] leading-[1.78] text-[var(--on-surface-dim)]">
                      {reason.body}
                    </p>
                    <div className="flex flex-wrap gap-2 pb-6 pt-4">
                      {reason.proofs.map(([label, ProofIcon]) => (
                        <span
                          key={label as string}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-[0.74rem] font-medium text-[var(--on-surface-dim)]"
                        >
                          <ProofIcon
                            size={13}
                            stroke={1.7}
                            style={{ color: reason.accent }}
                          />
                          {label as string}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pt-8">
            <p className="body-md max-w-xl text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]">
              Still weighing your options? One call is enough to scope the
              project, name the constraints, and decide whether Andishi is the
              right fit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
              >
                Book a scoping call
                <IconArrowRight size={15} stroke={2} />
              </Link>
              <Link
                href="#process"
                className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
              >
                See our process
              </Link>
            </div>
          </div>
        </div>
      </CustomCursorRegion>
    </section>
  );
}
