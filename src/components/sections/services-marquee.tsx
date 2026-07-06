"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import {
  IconApi,
  IconBrain,
  IconCloud,
  IconCurrencyEthereum,
  IconDeviceMobile,
  IconStack2,
} from "@tabler/icons-react";

// Register ScrollTrigger if running on the client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const talentStripItems = [
  { label: "Web Apps", meta: "Next.js / React", icon: IconStack2 },
  { label: "SaaS builds", meta: "Stripe / Multi-tenant", icon: IconBrain },
  { label: "AI Systems", meta: "LLMs / Agents", icon: IconCloud },
  { label: "Blockchain", meta: "Web3 / Solidity", icon: IconCurrencyEthereum },
  { label: "APIs", meta: "GraphQL / REST", icon: IconApi },
  { label: "Mobile Apps", meta: "iOS / Android", icon: IconDeviceMobile },
];

const proofStats = [
  { value: 32, suffix: "+", label: "products shipped" },
  { value: 100, suffix: "%", label: "IP owned by you" },
  { value: 8, suffix: "", label: "service domains" },
];

export function ServicesMarquee() {
  const container = useRef<HTMLDivElement>(null);
  const marqueeInner = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      let marqueeTween: gsap.core.Tween | null = null;
      let marqueeWidth = marqueeInner.current?.scrollWidth || 0;

      // 1. Infinite Horizontal Marquee
      // Calculate scrollWidth and start the infinite tween
      const initMarquee = () => {
        if (!marqueeInner.current) return;
        
        // Kill existing tween if any
        if (marqueeTween) {
          marqueeTween.kill();
        }

        marqueeWidth = marqueeInner.current.scrollWidth;

        marqueeTween = gsap.to(marqueeInner.current, {
          x: () => -(marqueeWidth / 3),
          duration: 28,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) => {
              const w = marqueeWidth || 1;
              return parseFloat(x) % (w / 3);
            }),
          },
        });
      };

      // Initial run
      initMarquee();

      // Recalculate marquee on window resize to keep it perfectly responsive
      const handleResize = () => {
        initMarquee();
      };
      window.addEventListener("resize", handleResize);

      // 2. Responsive ScrollTrigger Animations using matchMedia
      // Desktop / Tablet animations
      mm.add("(min-width: 768px)", () => {
        countersRef.current.forEach((counter, i) => {
          if (!counter) return;
          const targetVal = proofStats[i].value;

          gsap.fromTo(
            counter,
            { innerText: 0 },
            {
              innerText: targetVal,
              duration: 2.5,
              ease: "power3.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: counter,
                start: "top 85%",
              },
            }
          );
        });

        gsap.fromTo(
          ".stat-label",
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".stats-container",
              start: "top 85%",
            },
          }
        );
      });

      // Mobile animations (simplified for performance and viewport height)
      mm.add("(max-width: 767px)", () => {
        countersRef.current.forEach((counter, i) => {
          if (!counter) return;
          const targetVal = proofStats[i].value;

          gsap.fromTo(
            counter,
            { innerText: 0 },
            {
              innerText: targetVal,
              duration: 1.8,
              ease: "power2.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: counter,
                start: "top 90%",
              },
            }
          );
        });

        gsap.fromTo(
          ".stat-label",
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".stats-container",
              start: "top 90%",
            },
          }
        );
      });

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        if (marqueeTween) marqueeTween.kill();
        mm.revert();
      };
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative z-20 py-28 max-sm:py-16 w-full overflow-hidden border-y border-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--bg-deep)_30%,transparent),var(--bg))]"
    >
      {/* Cinematic subtle background glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--primary)_5%,transparent),transparent_60%)] pointer-events-none" />

      {/* 1. Marquee Row */}
      <div className="relative z-10 flex w-max">
        <div
          ref={marqueeInner}
          className="flex items-center justify-start gap-4 px-4 sm:gap-6 sm:px-6"
        >
          {/* Render the strip 3 times for seamless looping */}
          {[...Array(3)].map((_, arrayIndex) => (
            <div key={arrayIndex} className="flex shrink-0 items-center gap-4 sm:gap-6">
              {talentStripItems.map(({ label, meta, icon: Icon }) => (
                <div
                  key={`${arrayIndex}-${label}`}
                  className="group flex shrink-0 cursor-default items-center gap-5 max-sm:gap-3.5 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface-low)_32%,transparent)] px-8 py-4 max-sm:px-5 max-sm:py-2.5 shadow-sm transition-all duration-300 hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--primary)_10%,transparent)] backdrop-blur-md"
                >
                  <div className="flex h-12 w-12 max-sm:h-9 max-sm:w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-[var(--bg)] shadow-inner [&_svg]:w-6 [&_svg]:h-6 max-sm:[&_svg]:w-4.5 max-sm:[&_svg]:h-4.5">
                    <Icon stroke={1.6} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[1.1rem] max-sm:text-[0.92rem] font-medium text-[var(--on-surface)] leading-tight">
                      {label}
                    </span>
                    <span className="mt-0.5 font-mono text-[0.75rem] max-sm:text-[0.62rem] uppercase tracking-widest text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                      {meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Stats and Typography Grid */}
      <div className="stats-container relative z-10 mx-auto mt-24 max-sm:mt-16 max-w-[80rem] px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md border-l border-[color-mix(in_srgb,var(--primary)_30%,transparent)] pl-6">
            <h2 className="label-caps text-[var(--primary)] mb-3 tracking-[0.2em] max-sm:text-[0.7rem]">
              OUR CAPABILITIES
            </h2>
            <p className="title-serif text-3xl md:text-4xl leading-[1.1] text-[var(--on-surface)] max-sm:text-[1.65rem]">
              Product engineering for ambitious founders.
            </p>
          </div>

          <div className="grid grid-cols-3 max-[480px]:grid-cols-1 gap-y-10 gap-x-8 sm:gap-12 lg:gap-20">
            {proofStats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col">
                <div className="flex items-baseline text-[color-mix(in_srgb,var(--on-surface)_94%,transparent)] font-mono tracking-tighter">
                  <span
                    ref={(el) => {
                      countersRef.current[i] = el;
                    }}
                    className="text-5xl md:text-6xl max-sm:text-4xl"
                  >
                    0
                  </span>
                  <span className="text-3xl md:text-4xl max-sm:text-2.5xl ml-1 text-[var(--primary)] font-medium">
                    {stat.suffix}
                  </span>
                </div>
                <span className="stat-label mt-3 text-[0.8rem] max-sm:text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--on-surface-dim)_80%,transparent)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
