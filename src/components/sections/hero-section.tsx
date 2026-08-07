"use client";

import { IconArrowRight, IconChartLine, IconBrandWhatsapp } from "@tabler/icons-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { fadeUp, stagger } from "@/lib/motion";
import { ServicesMarquee } from "./services-marquee";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const numberClass = "font-mono font-normal tabular-nums tracking-tight";

export function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <>
      <section
        ref={ref}
        className="relative z-10 isolate overflow-hidden bg-[var(--bg)] pb-12 min-[900px]:pb-16 lg:pb-20 xl:pb-24 pt-36 min-[900px]:pt-40 lg:pt-48 xl:py-60"
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

        <div className="relative z-[5] mx-auto grid min-h-[calc(100svh_-_10rem)] w-[min(calc(100%_-_2.5rem),92rem)] items-start gap-8 pb-16 min-[900px]:grid-cols-[minmax(22rem,1.1fr)_minmax(18rem,0.9fr)] lg:grid-cols-[minmax(26rem,1.08fr)_minmax(22rem,0.92fr)] xl:grid-cols-[minmax(25rem,0.92fr)_minmax(28rem,1.08fr)] max-[899px]:min-h-0 max-[560px]:w-[min(calc(100%_-_2.5rem),92rem)] max-[560px]:gap-6 max-[560px]:pb-14">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex max-w-[43rem] min-[900px]:max-w-[46rem] xl:max-w-[43rem] flex-col gap-5 max-[560px]:gap-4"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_54%,transparent)] px-3 py-2 text-[0.64rem] font-medium uppercase leading-none tracking-[0.18em] text-[color-mix(in_srgb,var(--primary)_78%,var(--on-surface))] backdrop-blur-xl max-[560px]:text-[0.66rem] max-[560px]:leading-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)] shadow-[0_0_18px_color-mix(in_srgb,var(--tertiary)_70%,transparent)]" />
                DIGITAL ENGINEERING & PRODUCT STUDIO
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="title-serif m-0 max-w-[18ch] min-[900px]:max-w-[19ch] xl:max-w-[18ch] text-[clamp(2.5rem,6vw,3.2rem)] min-[900px]:text-[clamp(2.65rem,4.2vw,3.35rem)] lg:text-[clamp(3.15rem,4.4vw,3.95rem)] xl:text-[clamp(4.25rem,6.8vw,5.65rem)] font-normal leading-[0.98] min-[900px]:leading-[1.01] xl:leading-[0.98] tracking-tighter text-[var(--on-surface)] max-[899px]:max-w-[16ch]"
            >
              Software products engineered from concept to launch.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="m-0 max-w-[69ch] text-[clamp(1.04rem,3.6vw,1.06rem)] leading-[1.65] text-[color-mix(in_srgb,var(--on-surface-dim)_92%,var(--on-surface))] max-[560px]:text-base"
            >
              We engineer scalable applications, SaaS platforms, AI systems, mobile apps, and
              enterprise tools for founders and teams who demand shipped products and tangible
              impact.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] no-underline shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_22px_52px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
              >
                <IconBrandWhatsapp size={17} stroke={2} />
                Chat with us
              </a>
              <Link
                href="/work"
                className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] no-underline shadow-[inset_0_1px_0_color-mix(in_srgb,white_20%,transparent),0_12px_30px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] max-[899px]:flex-1 max-[899px]:basis-48 max-[560px]:min-h-[2.3rem] max-[560px]:text-[0.95rem]"
              >
                View Portfolio
                <IconArrowRight size={15} stroke={2.2} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="min-w-0"
          >
            <div className="relative hidden min-[900px]:block h-[22rem] lg:h-[27rem] xl:h-[40rem] w-full max-w-[28rem] lg:max-w-[34rem] xl:w-[120%] xl:max-w-[48rem] xl:-mr-[10%] min-[900px]:ml-auto xl:ml-0 mt-2">
              {/* Card 1: Roi Stationaries (Base, Top Right) */}
              <div className="absolute right-0 top-0 z-[1] w-[15rem] lg:w-[19.5rem] xl:w-[34rem] overflow-hidden rounded-[1.2rem] xl:rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_20px_50px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] xl:shadow-[0_32px_80px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)]">
                <Image
                  src="/images/mockups/roi_stationaries.png"
                  alt="Roi Stationaries UI Mockup"
                  width={1200}
                  height={750}
                  className="h-auto w-full object-cover aspect-[16/10] object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent xl:from-black/80 xl:via-black/20 pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.2rem] xl:rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              {/* Card 2: Haraka Fleet (Middle Left, Floating) */}
              <div className="animate-float-slow absolute left-0 top-[4.25rem] lg:top-[6rem] xl:top-[12rem] z-[3] w-[13.5rem] lg:w-[17.5rem] xl:w-[32rem] overflow-hidden rounded-[1.2rem] xl:rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_24px_60px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)] xl:shadow-[0_40px_100px_color-mix(in_srgb,var(--bg-deep)_80%,transparent)]">
                <Image
                  src="/images/mockups/haraka_fleet.png"
                  alt="Haraka Fleet UI Mockup"
                  width={1200}
                  height={750}
                  className="h-auto w-full object-cover aspect-[16/10] object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent xl:from-black/80 xl:via-black/20 pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.2rem] xl:rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              {/* Card 3: Kenyan Fintech (Bottom Right, Slower Float) */}
              <div className="animate-float-slower absolute right-[0.5rem] lg:right-[1.25rem] xl:right-[4rem] bottom-[1rem] lg:bottom-[1.5rem] xl:bottom-0 z-[2] w-[8.75rem] lg:w-[11rem] xl:w-[18rem] overflow-hidden rounded-[1.2rem] xl:rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] shadow-[0_24px_60px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)] xl:shadow-[0_40px_100px_color-mix(in_srgb,var(--bg-deep)_80%,transparent)]">
                <Image
                  src="/images/mockups/kenyan_fintech.png"
                  alt="Kenyan Fintech UI Mockup"
                  width={600}
                  height={800}
                  className="h-auto w-full object-cover aspect-[3/4] object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent xl:from-black/80 xl:via-black/20 pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.2rem] xl:rounded-[1.35rem] ring-1 ring-inset ring-[color-mix(in_srgb,white_10%,transparent)]" />
              </div>

              <div className="absolute right-[0.5rem] lg:right-[1rem] bottom-0 lg:bottom-[0.5rem] xl:bottom-auto xl:top-[34.5rem] z-[4] flex items-center gap-2 xl:gap-3 rounded-[0.9rem] lg:rounded-[1rem] xl:rounded-[1.2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_72%,transparent),color-mix(in_srgb,var(--surface-high)_42%,transparent))] px-2.5 py-1.5 lg:px-3 lg:py-2 xl:px-4 xl:py-3 text-[var(--on-surface)] shadow-[0_16px_50px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)] xl:shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_70%,transparent)] backdrop-blur-[28px]">
                <IconChartLine className="text-[var(--tertiary)]" size={16} stroke={1.8} />
                <div>
                  <strong
                    className={`${numberClass} block text-[0.95rem] lg:text-[1.15rem] xl:text-[1.35rem]`}
                  >
                    32+
                  </strong>
                  <span className="block text-[0.62rem] lg:text-[0.7rem] xl:text-[0.78rem] font-medium uppercase text-[var(--on-surface-dim)]">
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
          <p className="label-caps mb-5 text-[var(--primary)]">THE REAL SITUATION</p>
          <h2 className="headline-lg text-[var(--on-surface)]">
            Writing code is straightforward. Delivering a successful product is not.
          </h2>
          <div className="body-md mt-6 space-y-4 text-[var(--on-surface-dim)] leading-relaxed">
            <p>
              You&apos;ve likely briefed an agency before. You received a proposal with a six-week
              start date and a 90-day timeline, paid a hefty deposit, and ultimately got a product
              that barely resembled your original vision.
            </p>
            <p>
              Or perhaps you hired multiple freelancers. Each owned a different piece of the puzzle,
              but nobody took responsibility for the entire outcome.
            </p>
            <p>
              Andishi operates differently. We scope your requirements in a single call. We write
              the technical brief. We ship in weeks, not quarters. Above all, we measure our success
              by the tangible impact on your business, not by the sheer length of a deliverables
              checklist.
            </p>
            <p>
              Prefer to build in-house? We also embed senior engineering talent into existing teams
              who need to scale quickly. Both pathways are fully supported.
            </p>
          </div>
        </motion.div>
      </section>

      <ServicesMarquee />
    </>
  );
}
