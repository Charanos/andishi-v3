"use client";

import {
  IconArrowRight,
  IconChartLine,
} from "@tabler/icons-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { fadeUp, stagger } from "@/lib/motion";
import { ServicesMarquee } from "./services-marquee";

const numberClass = "font-mono font-normal tabular-nums tracking-tight";

export function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <>
      <section
        ref={ref}
        className="relative z-10 isolate overflow-hidden bg-[var(--bg)] pb-24 pt-36 lg:py-50"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_srgb,var(--tertiary)_14%,transparent),transparent_20rem),radial-gradient(circle_at_78%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_26rem),radial-gradient(circle_at_48%_86%,color-mix(in_srgb,var(--tertiary)_8%,transparent),transparent_22rem)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[1] w-[max(112vw,1600px)] -translate-x-1/2 bg-no-repeat opacity-[var(--hero-overlay-opacity)] [background-image:var(--hero-overlay-src)] [background-position:center_right] [background-size:99%_auto] [mix-blend-mode:var(--hero-overlay-blend)] max-[899px]:w-[210vw] max-[899px]:opacity-[0.36] max-[899px]:[background-position:center_5rem]"
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

        <div className="relative z-[5] mx-auto grid min-h-[calc(100svh_-_10rem)] w-[min(calc(100%_-_2.5rem),92rem)] items-start gap-8 pb-16 min-[900px]:grid-cols-[minmax(25rem,0.92fr)_minmax(28rem,1.08fr)] max-[899px]:min-h-0 max-[560px]:w-[min(calc(100%_-_2.5rem),92rem)] max-[560px]:gap-6 max-[560px]:pb-14">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex max-w-[43rem] flex-col gap-5 max-[560px]:gap-4"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_54%,transparent)] px-3 py-2 text-[0.64rem] font-medium uppercase leading-none tracking-[0.18em] text-[color-mix(in_srgb,var(--primary)_78%,var(--on-surface))] backdrop-blur-xl max-[560px]:text-[0.66rem] max-[560px]:leading-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)] shadow-[0_0_18px_color-mix(in_srgb,var(--tertiary)_70%,transparent)]" />
                SOFTWARE DEVELOPMENT & PRODUCT STUDIO
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="title-serif m-0 max-w-[19ch] text-[clamp(3rem,7.4vw,5.65rem)] font-normal leading-[0.98] tracking-tighter text-[var(--on-surface)] max-[899px]:max-w-[16ch] max-[899px]:text-[clamp(2.85rem,10vw,3.55rem)] max-[560px]:text-[clamp(2.55rem,11vw,3.2rem)]"
            >
              Software products engineered from concept to launch.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="m-0 max-w-[69ch] text-[clamp(1.04rem,3.6vw,1.06rem)] leading-[1.65] text-[color-mix(in_srgb,var(--on-surface-dim)_92%,var(--on-surface))] max-[560px]:text-base"
            >
              Custom software, SaaS platforms, AI systems, mobile apps, and enterprise tools. For founders and teams who need working software, not another project plan.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/start-project"
                className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] no-underline shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_22px_52px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
              >
                Start a Project
                <IconArrowRight size={15} stroke={2.2} />
              </Link>
              <Link
                href="/work"
                className="inline-flex min-h-[2.4rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] no-underline shadow-[inset_0_1px_0_color-mix(in_srgb,white_20%,transparent),0_12px_30px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
              >
                See Our Work
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="min-w-0"
          >
            <div className="relative hidden min-[900px]:block h-[40rem] w-[120%] max-w-[48rem] -mr-[10%] mt-2">
              {/* Card 1: Roi Stationaries (Base, Top Right) */}
              <div className="absolute right-0 top-0 z-[1] w-[34rem] overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_32px_80px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)]">
                <Image
                  src="/images/mockups/roi_stationaries.png"
                  alt="Roi Stationaries UI Mockup"
                  width={1200}
                  height={750}
                  className="h-auto w-full object-cover aspect-[16/10] object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              {/* Card 2: Haraka Fleet (Middle Left, Floating) */}
              <div className="animate-float-slow absolute left-0 top-[12rem] z-[3] w-[32rem] overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_40px_100px_color-mix(in_srgb,var(--bg-deep)_80%,transparent)]">
                <Image
                  src="/images/mockups/haraka_fleet.png"
                  alt="Haraka Fleet UI Mockup"
                  width={1200}
                  height={750}
                  className="h-auto w-full object-cover aspect-[16/10] object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              {/* Card 3: Kenyan Fintech (Bottom Right, Slower Float) */}
              <div className="animate-float-slower absolute right-[4rem] bottom-0 z-[2] w-[18rem] overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_40px_100px_color-mix(in_srgb,var(--bg-deep)_80%,transparent)]">
                <Image
                  src="/images/mockups/kenyan_fintech.png"
                  alt="Kenyan Fintech UI Mockup"
                  width={600}
                  height={800}
                  className="h-auto w-full object-cover aspect-[3/4] object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              <div className="absolute right-[1rem] top-[34.5rem] z-[4] flex items-center gap-3 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_72%,transparent),color-mix(in_srgb,var(--surface-high)_42%,transparent))] px-4 py-3 text-[var(--on-surface)] shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_70%,transparent)] backdrop-blur-[28px]">
                <IconChartLine
                  className="text-[var(--tertiary)]"
                  size={18}
                  stroke={1.8}
                />
                <div>
                  <strong className={`${numberClass} block text-[1.35rem]`}>
                    32+
                  </strong>
                  <span className="block text-[0.78rem] font-medium uppercase text-[var(--on-surface-dim)]">
                    shipped builds
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
          className="relative z-20 mx-auto max-w-3xl px-6 pt-20 text-center sm:px-8 lg:pt-24"
        >
          <p className="label-caps mb-5 text-[var(--primary)]">
            THE REAL SITUATION
          </p>
          <h2 className="headline-lg text-[var(--on-surface)]">
            Building software is straightforward. Getting it delivered is not.
          </h2>
          <div className="body-md mt-6 space-y-4 text-[var(--on-surface-dim)] leading-relaxed">
            <p>
              You&apos;ve briefed an agency. Got a proposal with a six-week start date and a 90-day timeline. Paid a deposit. Got a product that didn&apos;t match the brief.
            </p>
            <p>
              Or you hired freelancers. Three of them. Each owned a different piece. Nobody owned the whole thing.
            </p>
            <p>
              Andishi works differently. We scope in a single call. We write the brief, not you. We ship in weeks, not quarters. And we measure success by what changes for your business, not by the length of the deliverables list.
            </p>
            <p>
              We also place senior engineers with teams who&apos;d rather extend their own team than hand a project to us. Both options are on the table.
            </p>
          </div>
        </motion.div>
      </section>

      <ServicesMarquee />
    </>
  );
}
