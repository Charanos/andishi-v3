"use client";

import {
  IconApi,
  IconArrowRight,
  IconBrain,
  IconChartLine,
  IconCloud,
  IconCode,
  IconCurrencyEthereum,
  IconDatabase,
  IconDeviceMobile,
  IconGridDots,
  IconShieldCheck,
  IconStack2,
  IconUsers,
} from "@tabler/icons-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { fadeUp, stagger } from "@/lib/motion";

const metricCards = [
  { label: "Profiles", value: "48h", change: "matched" },
  { label: "Seniority", value: "5+ yrs", change: "minimum" },
  { label: "Overlap", value: "UTC+0-3", change: "Africa" },
];

const projectRows = [
  { name: "Full-stack lead", progress: "92%", status: "Matched" },
  { name: "AI integration", progress: "68%", status: "Vetting" },
  { name: "AWS engineer", progress: "84%", status: "Ready" },
];

const systemNodes = [
  { label: "React", icon: IconGridDots },
  { label: "APIs", icon: IconCode },
  { label: "Cloud", icon: IconDatabase },
  { label: "Vetted", icon: IconShieldCheck },
];

const proofStats = [
  { value: "50+", label: "engineers placed globally" },
  { value: "8", label: "days average time to placement" },
  { value: "12", label: "engineering domains covered" },
];

const talentStripItems = [
  { label: "Full-stack", meta: "React / Node", icon: IconStack2 },
  { label: "AI engineers", meta: "LLMs / RAG", icon: IconBrain },
  { label: "Cloud & AWS", meta: "Infra / DevOps", icon: IconCloud },
  { label: "Web3", meta: "Solidity", icon: IconCurrencyEthereum },
  { label: "Backend APIs", meta: "Data / auth", icon: IconApi },
  { label: "Mobile", meta: "iOS / Android", icon: IconDeviceMobile },
];

const numberClass = "font-mono font-normal tabular-nums tracking-tight";

const panelClass =
  "relative overflow-hidden rounded-[1.45rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_74%,transparent),color-mix(in_srgb,var(--surface-high)_42%,transparent))] p-4 shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_64%,transparent)] backdrop-blur-[28px]";

function PanelTexture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.16]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 10.5v7M10.5 14h7' stroke='%238c6cd9' stroke-width='0.75' stroke-linecap='round' opacity='0.28'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 22%, transparent) 0 1px, transparent 1.7px)",
        backgroundPosition: "0 0, 14px 14px",
        backgroundSize: "28px 28px, 28px 28px",
      }}
    />
  );
}

export function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      ref={ref}
      className="relative z-10 isolate overflow-hidden bg-[var(--bg)] pb-24 pt-36 md:pt-40 lg:pb-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_srgb,var(--secondary)_14%,transparent),transparent_20rem),radial-gradient(circle_at_78%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_26rem),radial-gradient(circle_at_48%_86%,color-mix(in_srgb,var(--tertiary)_8%,transparent),transparent_22rem)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[1] w-[max(112vw,1600px)] -translate-x-1/2 bg-no-repeat opacity-[var(--hero-overlay-opacity)] [background-image:var(--hero-overlay-src)] [background-position:center_top] [background-size:100%_auto] [mix-blend-mode:var(--hero-overlay-blend)] max-[899px]:w-[210vw] max-[899px]:opacity-[0.36] max-[899px]:[background-position:center_5rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_92%,transparent)_0%,color-mix(in_srgb,var(--bg)_78%,transparent)_34%,color-mix(in_srgb,var(--bg)_30%,transparent)_64%,color-mix(in_srgb,var(--bg)_58%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_78%,transparent)_0%,transparent_26%,color-mix(in_srgb,var(--bg)_48%,transparent)_58%,color-mix(in_srgb,var(--bg)_82%,transparent)_100%)] max-[899px]:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg)_88%,transparent)_0%,color-mix(in_srgb,var(--bg)_68%,transparent)_42%,color-mix(in_srgb,var(--bg)_84%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[18rem] z-[3] h-[20rem] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--bg)_36%,transparent)_48%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[26rem] bg-[radial-gradient(ellipse_at_50%_18%,color-mix(in_srgb,var(--bg)_26%,transparent),transparent_64%),linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--bg)_30%,transparent)_28%,var(--bg)_100%)]"
      />

      <div className="relative z-[5] mx-auto grid min-h-[calc(100svh_-_10rem)] w-[min(calc(100%_-_2rem),87rem)] items-start gap-8 pb-16 min-[900px]:grid-cols-[minmax(25rem,0.92fr)_minmax(28rem,1.08fr)] max-[899px]:min-h-0 max-[560px]:w-[min(calc(100%_-_1rem),87rem)] max-[560px]:gap-6 max-[560px]:pb-14">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex max-w-[43rem] flex-col gap-5 max-[560px]:gap-4"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_54%,transparent)] px-3 py-2 text-[0.64rem] font-medium uppercase leading-none tracking-[0.18em] text-[color-mix(in_srgb,var(--primary)_78%,var(--on-surface))] backdrop-blur-xl max-[560px]:text-[0.66rem] max-[560px]:leading-tight">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] shadow-[0_0_18px_color-mix(in_srgb,var(--secondary)_70%,transparent)]" />
              Senior African Engineers / Global Startups
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="m-0 max-w-[12ch] text-[clamp(2.85rem,7vw,4.85rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)] max-[899px]:max-w-[12ch] max-[899px]:text-[clamp(2.7rem,12vw,3.9rem)] max-[560px]:text-[clamp(2.35rem,12vw,3.1rem)]"
          >
            Africa&apos;s senior engineers. Your startup&apos;s next hire.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="m-0 max-w-[43rem] text-[clamp(1.04rem,3.6vw,1.16rem)] leading-[1.65] text-[color-mix(in_srgb,var(--on-surface-dim)_92%,var(--on-surface))] max-[560px]:text-base"
          >
            Andishi places vetted, senior software engineers from across Africa
            with global startups that need to ship faster without the six-month
            recruiting cycle or junior-heavy agency model.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/services"
              className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] no-underline shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_22px_52px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
            >
              See Our Engineers
              <IconArrowRight size={15} stroke={2.2} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[2.4rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] no-underline shadow-[inset_0_1px_0_color-mix(in_srgb,white_20%,transparent),0_12px_30px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
            >
              Talk to us about your need
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="min-w-0"
        >
          <div className="relative hidden md:flex flex-col items-end pb-6 max-[560px]:pb-0">
            <div
              className={`${panelClass} relative z-[1] w-[min(100%,38.5rem)] max-[899px]:w-full max-[560px]:rounded-[1.15rem] max-[560px]:p-3`}
            >
              <PanelTexture />
              <div className="relative z-[1] flex items-start justify-between gap-4">
                <div>
                  <span className="text-[0.8rem] font-medium tracking-[0.04em] text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]">
                    Overview
                  </span>
                  <h2 className="mt-1 text-[1.05rem] font-medium text-[var(--on-surface)]">
                    Talent match cockpit
                  </h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[0.9rem] bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
                  <IconChartLine size={16} stroke={1.7} />
                </span>
              </div>

              <div className="relative z-[1] mt-4 grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
                {metricCards.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface-low)_64%,transparent)] p-3"
                  >
                    <span className="block text-[0.78rem] font-medium text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)]">
                      {metric.label}
                    </span>
                    <strong
                      className={`${numberClass} mt-1 block text-[clamp(1rem,2vw,1.45rem)] text-[var(--on-surface)]`}
                    >
                      {metric.value}
                    </strong>
                    <small
                      className={`${numberClass} mt-0.5 block text-[0.78rem] text-[var(--tertiary)]`}
                    >
                      {metric.change}
                    </small>
                  </div>
                ))}
              </div>

              <div className="relative z-[1] mt-3 overflow-hidden rounded-[1.1rem] bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--primary)_8%,transparent))] max-[560px]:max-h-32">
                <svg
                  viewBox="0 0 520 180"
                  role="img"
                  aria-label="Weekly growth chart"
                  className="block h-40 w-full max-[560px]:h-28"
                  preserveAspectRatio="none"
                  style={{ color: "var(--primary-fixed-dim)" }}
                >
                  <defs>
                    <linearGradient
                      id="hero-chart-fill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.34"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--secondary)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M8 150 C54 150 60 120 104 120 S158 138 196 105 260 78 306 96 352 52 412 62 470 100 512 36"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                  <path
                    d="M8 150 C54 150 60 120 104 120 S158 138 196 105 260 78 306 96 352 52 412 62 470 100 512 36 L512 180 L8 180 Z"
                    fill="url(#hero-chart-fill)"
                  />
                  <circle cx="512" cy="36" r="8" fill="#00C6FB" />
                </svg>
              </div>
            </div>

            <div
              className={`${panelClass} relative z-[3] -mt-44 mr-18 w-[min(calc(100%_-_1rem),35rem)] max-[899px]:mr-0 max-[899px]:w-[calc(100%_-_1rem)] max-[560px]:-mt-12 max-[560px]:mr-2 max-[560px]:w-[calc(100%_-_1rem)] max-[560px]:rounded-[1.15rem] max-[560px]:p-3`}
            >
              <PanelTexture />
              <div className="relative z-[1] mb-3 flex items-center justify-between text-[var(--on-surface)]">
                <h3 className="text-[1.05rem] font-medium">Projects</h3>
                <IconUsers size={17} stroke={1.8} />
              </div>
              {projectRows.map((row) => (
                <div
                  key={row.name}
                  className="relative z-[1] grid grid-cols-[minmax(7rem,1fr)_minmax(5rem,9rem)_auto] items-center gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] py-2.5 text-[0.9rem] text-[color-mix(in_srgb,var(--on-surface)_72%,transparent)] max-[560px]:grid-cols-1 max-[560px]:gap-1"
                >
                  <span>{row.name}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                    <i
                      className="block h-full rounded-[inherit] bg-[var(--gradient-brand)]"
                      style={{ width: row.progress }}
                    />
                  </div>
                  <small className="text-[0.74rem] font-medium text-[var(--tertiary)]">
                    {row.status}
                  </small>
                </div>
              ))}
            </div>

            <div
              className={`${panelClass} relative z-[2] -mt-8 self-start w-[min(calc(100%_-_3rem),33.5rem)] max-[899px]:w-[calc(100%_-_2rem)] max-[560px]:hidden`}
            >
              <PanelTexture />
              <span className="relative z-[1] text-[0.8rem] font-medium tracking-[0.04em] text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]">
                Skill coverage
              </span>
              <div className="relative z-[1] mt-3 grid grid-cols-4 gap-2.5">
                {systemNodes.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-[0.9rem] border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface-low)_64%,transparent)] text-[0.78rem] font-medium text-[color-mix(in_srgb,var(--on-surface)_74%,transparent)]"
                  >
                    <Icon size={16} stroke={1.7} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-0 top-[28.75rem] z-[4] flex items-center gap-3 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_72%,transparent),color-mix(in_srgb,var(--surface-high)_42%,transparent))] px-4 py-3 text-[var(--on-surface)] shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_70%,transparent)] backdrop-blur-[28px] max-[899px]:right-2 max-[899px]:top-[16.75rem] max-[560px]:hidden">
              <IconChartLine
                className="text-[var(--secondary)]"
                size={18}
                stroke={1.8}
              />
              <div>
                <strong className={`${numberClass} block text-[1.35rem]`}>
                  8d
                </strong>
                <span className="block text-[0.78rem] font-medium uppercase text-[var(--on-surface-dim)]">
                  avg placement
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-30 mx-auto w-[min(calc(100%_-_3rem),64rem)] rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_76%,transparent),color-mix(in_srgb,var(--surface-high)_46%,transparent))] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,white_18%,transparent),0_24px_70px_color-mix(in_srgb,var(--bg-deep)_54%,transparent),0_0_0_1px_color-mix(in_srgb,var(--secondary)_12%,transparent)] backdrop-blur-2xl max-[560px]:w-[min(calc(100%_-_1rem),64rem)] max-[560px]:rounded-[0.9rem] max-[560px]:p-3"
      >
        <p className="mb-3 text-[0.74rem] font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--on-surface-dim)_78%,transparent)] max-[560px]:text-[0.7rem]">
          Vetted talent coverage for startup teams
        </p>
        <div className="grid grid-cols-6 items-center gap-2 max-[560px]:grid-cols-3">
          {talentStripItems.map(({ label, meta, icon: Icon }) => (
            <span
              key={label}
              className="flex min-h-[4.1rem] flex-col items-center justify-center gap-1 rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface-low)_58%,transparent)] px-2.5 py-2 text-center shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent)]"
            >
              <Icon
                aria-hidden="true"
                size={19}
                stroke={1.7}
                className="text-[var(--primary)]"
              />
              <strong className="text-[0.86rem] font-medium leading-tight tracking-tight text-[var(--on-surface)] max-[560px]:text-[0.8rem]">
                {label}
              </strong>
              <small className="font-mono text-[0.68rem] leading-none text-[color-mix(in_srgb,var(--on-surface-dim)_78%,transparent)] max-[560px]:text-[0.64rem]">
                {meta}
              </small>
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pt-3 max-[560px]:grid-cols-1 max-[560px]:gap-2">
          {proofStats.map((stat) => (
            <span
              key={stat.label}
              className="flex min-w-0 items-baseline gap-2 text-[0.8rem] leading-snug text-[color-mix(in_srgb,var(--on-surface-dim)_86%,transparent)]"
            >
              <strong
                className={`${numberClass} whitespace-nowrap text-[1.05rem] text-[var(--primary)]`}
              >
                {stat.value}
              </strong>
              {stat.label}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-20 mx-auto max-w-2xl px-6 pt-20 text-center sm:px-8 lg:pt-24"
      >
        <p className="label-caps mb-5 text-[var(--primary)]">
          The hiring reality
        </p>
        <h2 className="headline-lg text-[var(--on-surface)]">
          Hiring good engineers is broken. Most of you already know this.
        </h2>
        <div className="body-md mt-6 space-y-4 text-[var(--on-surface-dim)]">
          <p>
            You have posted on LinkedIn, paid recruiters, waited months,
            interviewed endlessly, and still watched the best candidates
            disappear before offer stage.
          </p>
          <p>
            The talent is already here. Andishi finds senior African engineers,
            vets them rigorously, handles the engagement, and helps them start
            inside your stack, tools, and timezone.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
