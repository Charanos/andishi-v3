"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconExternalLink,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { showcaseProjects } from "@/content/landing";
import { cosmicSpring } from "@/lib/motion";

const AUTO_ADVANCE_MS = 6000;
const USER_RESET_MS = 8000;

const textContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: cosmicSpring },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

function padProjectNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ProjectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoDelay, setAutoDelay] = useState(AUTO_ADVANCE_MS);
  const [timerVersion, setTimerVersion] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const total = showcaseProjects.length;
  const activeProject = showcaseProjects[activeIndex];

  const progressWidth = useMemo(
    () => `${((activeIndex + 1) / total) * 100}%`,
    [activeIndex, total],
  );

  const resetAutoAdvance = useCallback(() => {
    setAutoDelay(USER_RESET_MS);
    setTimerVersion((version) => version + 1);
  }, []);

  const selectProject = useCallback(
    (index: number, userInitiated = false) => {
      setActiveIndex((current) => {
        const next = (index + total) % total;
        return next === current ? current : next;
      });

      if (userInitiated) {
        resetAutoAdvance();
      }
    },
    [resetAutoAdvance, total],
  );

  const goToNext = useCallback(
    (userInitiated = false) => {
      setActiveIndex((current) => (current + 1) % total);

      if (userInitiated) {
        resetAutoAdvance();
      }
    },
    [resetAutoAdvance, total],
  );

  const goToPrevious = useCallback(
    (userInitiated = false) => {
      setActiveIndex((current) => (current - 1 + total) % total);

      if (userInitiated) {
        resetAutoAdvance();
      }
    },
    [resetAutoAdvance, total],
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeout = window.setTimeout(() => {
      goToNext(false);
      setAutoDelay(AUTO_ADVANCE_MS);
    }, autoDelay);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, autoDelay, goToNext, prefersReducedMotion, timerVersion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext(true);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToNext, goToPrevious]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frame = 0;

    const animateRing = () => {
      const pointer = pointerRef.current;
      pointer.rx += (pointer.mx - pointer.rx) * 0.12;
      pointer.ry += (pointer.my - pointer.ry) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pointer.rx}px, ${pointer.ry}px, 0) translate(-50%, -50%)`;
      }

      frame = window.requestAnimationFrame(animateRing);
    };

    frame = window.requestAnimationFrame(animateRing);
    return () => window.cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || prefersReducedMotion) return;

    pointerRef.current.mx = event.clientX;
    pointerRef.current.my = event.clientY;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] md:[cursor:none]"
      onPointerEnter={() => setCursorVisible(true)}
      onPointerLeave={() => setCursorVisible(false)}
      onPointerMove={handlePointerMove}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeProject.image}
          aria-hidden="true"
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.025 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={activeProject.image}
            alt=""
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 767px) 100vw, 96vw"
            className="scale-110 object-cover opacity-45 blur-2xl saturate-[0.85]"
          />
          <div className="absolute inset-y-[9%] right-[4%] left-[45%] hidden overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_22%,transparent)] shadow-[0_36px_120px_color-mix(in_srgb,var(--bg-deep)_58%,transparent)] backdrop-blur-xl md:block">
            <Image
              src={activeProject.image}
              alt=""
              fill
              priority={activeIndex === 0}
              sizes="55vw"
              className="object-contain p-6 saturate-[1.04]"
            />
          </div>
          <div className="absolute inset-x-5 top-28 h-[28rem] overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface)_26%,transparent)] shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_45%,transparent)] md:hidden">
            <Image
              src={activeProject.image}
              alt=""
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 767px) calc(100vw - 2.5rem), 55vw"
              className="object-contain p-4 opacity-78 saturate-[1.04]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_46%,color-mix(in_srgb,var(--bg)_72%,transparent)_100%)]" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,color-mix(in_srgb,var(--secondary)_6%,transparent),transparent_28rem)]"
          />
        </motion.div>
      </AnimatePresence>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_70%,transparent)_18%,color-mix(in_srgb,var(--bg)_38%,transparent)_58%,var(--bg)_100%),linear-gradient(105deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_92%,transparent)_34%,color-mix(in_srgb,var(--bg)_36%,transparent)_62%,color-mix(in_srgb,var(--bg)_18%,transparent)_100%)] md:bg-[linear-gradient(105deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_94%,transparent)_34%,color-mix(in_srgb,var(--bg)_34%,transparent)_62%,color-mix(in_srgb,var(--bg)_14%,transparent)_100%),linear-gradient(to_top,var(--bg)_0%,transparent_48%),linear-gradient(to_bottom,var(--bg)_0%,transparent_18%)]"
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-[2] hidden bg-[var(--bg)] md:block"
        animate={{
          clipPath:
            activeIndex % 2 === 0
              ? "polygon(0 0, 58% 0, 51% 100%, 0 100%)"
              : "polygon(0 0, 55% 0, 49% 100%, 0 100%)",
        }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] bg-[radial-gradient(circle_at_16%_22%,color-mix(in_srgb,var(--secondary)_7%,transparent),transparent_20rem),radial-gradient(circle_at_46%_78%,color-mix(in_srgb,var(--primary)_6%,transparent),transparent_24rem)]"
      />

      {!prefersReducedMotion && (
        <>
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-2.5 w-2.5 rounded-full bg-[var(--secondary)] opacity-0 mix-blend-difference transition-[height,width,opacity,background-color] duration-300 md:block"
            style={{ opacity: cursorVisible ? 1 : 0 }}
          />
          <div
            ref={ringRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[89] hidden h-9 w-9 rounded-full border border-[color-mix(in_srgb,var(--secondary)_48%,transparent)] opacity-0 transition-opacity duration-300 md:block"
            style={{ opacity: cursorVisible ? 1 : 0 }}
          />
        </>
      )}

      <motion.div
        key={`stat-${activeProject.title}`}
        className="pointer-events-none absolute bottom-32 right-[16.5rem] z-30 hidden min-w-44 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 shadow-[0_28px_80px_color-mix(in_srgb,var(--bg-deep)_66%,transparent)] backdrop-blur-2xl lg:block"
        initial={{ opacity: 0, y: 18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...cosmicSpring, delay: 0.22 }}
      >
        <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
          {activeProject.statLabel}
        </p>
        <p className="font-mono text-[1.75rem] leading-none tracking-tight text-[var(--tertiary)]">
          {activeProject.statValue}
        </p>
        <p className="mt-2 flex items-center gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)] shadow-[0_0_18px_color-mix(in_srgb,var(--tertiary)_54%,transparent)]" />
          {activeProject.statSub}
        </p>
      </motion.div>

      <div className="relative z-20 grid min-h-screen grid-cols-1 gap-8 px-5 pb-28 pt-24 sm:px-8 sm:pb-32 sm:pt-28 md:grid-cols-[4rem_minmax(0,1fr)_13.75rem] md:gap-0 md:px-0 md:pb-16 md:pt-0 lg:grid-cols-[5rem_minmax(0,1fr)_15rem]">
        <div className="hidden flex-col items-center gap-4 px-4 py-24 md:flex">
          <motion.p
            key={activeIndex}
            className="font-mono text-[1.65rem] leading-none tracking-tight text-[var(--on-surface)] [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cosmicSpring}
          >
            {padProjectNumber(activeIndex)}
          </motion.p>
          <div className="w-px flex-1 bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_35%,transparent),transparent)]" />
          <p className="font-mono text-[0.72rem] leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)] [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
            {padProjectNumber(total)}
          </p>
        </div>

        <div className="flex min-w-0 items-center px-0 md:px-8 lg:px-14 xl:px-18">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.title}
              variants={textContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-[41rem]"
            >
              <motion.p
                variants={textItem}
                className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)] max-[420px]:text-[0.68rem]"
              >
                <span className="h-px w-7 bg-[var(--secondary)]" />
                {activeProject.eyebrow}
              </motion.p>
              <motion.h2
                variants={textItem}
                className="m-0 text-[clamp(2.25rem,12vw,4.35rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)] md:text-[clamp(3rem,6vw,4.35rem)]"
              >
                {activeProject.title}
                <span className="block text-[var(--on-surface)]">
                  {activeProject.accent}
                </span>
              </motion.h2>
              <motion.p
                variants={textItem}
                className="body-md mt-6 max-w-[36rem] text-[var(--on-surface-dim)] sm:text-[1.04rem]"
              >
                {activeProject.summary}
              </motion.p>

              <motion.div
                variants={textItem}
                className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl sm:grid-cols-3"
              >
                {[
                  ["Timeline", activeProject.timeline],
                  ["Stack", activeProject.stack],
                  ["Status", activeProject.status],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className="border-b border-[var(--glass-border)] px-4 py-4 sm:border-b-0 sm:border-r sm:px-5 last:border-b-0 sm:last:border-r-0"
                  >
                    <p className="label-caps mb-1 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                      {label}
                    </p>
                    <p
                      className="font-mono text-[0.94rem] tracking-tight"
                      style={{
                        color:
                          index === 2 ? "var(--tertiary)" : "var(--on-surface)",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                variants={textItem}
                className="mt-7 flex flex-wrap gap-2"
              >
                {activeProject.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1.5 text-[0.72rem] font-medium text-[var(--on-surface-dim)]"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                          : "var(--glass-bg)",
                      borderColor:
                        index === 0
                          ? "color-mix(in srgb, var(--secondary) 28%, transparent)"
                          : "var(--glass-border)",
                      color:
                        index === 0
                          ? "var(--secondary)"
                          : "var(--on-surface-dim)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              <motion.div
                variants={textItem}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Link
                  href="/work"
                  className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  View work
                  <IconArrowRight size={15} stroke={2} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Scope similar
                </Link>
              </motion.div>

              <motion.div
                variants={textItem}
                className="mt-10 grid gap-3 sm:grid-cols-3 md:hidden"
              >
                {showcaseProjects.map((project, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={project.title}
                      type="button"
                      onClick={() => selectProject(index, true)}
                      className="relative min-h-24 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                      style={{
                        borderColor: isActive
                          ? "color-mix(in srgb, var(--secondary) 42%, transparent)"
                          : "var(--glass-border)",
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--secondary) 9%, transparent)"
                          : "var(--glass-bg)",
                      }}
                      aria-pressed={isActive}
                    >
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="33vw"
                        className="scale-110 object-cover opacity-20 blur-sm saturate-[0.7]"
                      />
                      <span className="absolute inset-2 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface)_20%,transparent)]">
                        <Image
                          src={project.image}
                          alt=""
                          fill
                          sizes="33vw"
                          className="object-contain p-2 opacity-62 saturate-[1.04]"
                        />
                      </span>
                      <span className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),color-mix(in_srgb,var(--bg)_42%,transparent))]" />
                      <span className="relative z-[1] block font-mono text-[0.68rem] text-[var(--secondary)]">
                        {padProjectNumber(index)}
                      </span>
                      <span className="relative z-[1] mt-5 block text-[0.84rem] font-medium leading-tight text-[var(--on-surface)]">
                        {project.title}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden min-h-0 flex-col md:flex">
          {showcaseProjects.map((project, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={project.title}
                type="button"
                onClick={() => selectProject(index, true)}
                className="group/sliver relative min-h-0 flex-1 overflow-hidden border-l border-[var(--glass-border)] text-left transition-[flex] duration-700 ease-[cubic-bezier(.76,0,.24,1)] hover:flex-[1.35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--secondary)_52%,transparent)]"
                style={{ flex: isActive ? 4 : 1 }}
                aria-label={`Show ${project.title}`}
                aria-pressed={isActive}
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-0 z-[4] w-0.5 bg-[var(--secondary)]"
                  initial={false}
                  animate={{ height: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                />
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="224px"
                  className="scale-110 object-cover brightness-[0.34] blur-sm saturate-[0.6] transition-transform duration-700 group-hover/sliver:scale-125"
                />
                <span className="absolute inset-3 z-[1] overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface)_18%,transparent)] opacity-60 transition-opacity duration-500 group-hover/sliver:opacity-80">
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="224px"
                    className="object-contain p-2 saturate-[0.92]"
                  />
                </span>
                <span className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,var(--bg)_0%,transparent_52%),linear-gradient(to_top,color-mix(in_srgb,var(--bg)_76%,transparent)_0%,transparent_62%)]" />
                <span
                  className="absolute bottom-6 left-1/2 z-[3] block origin-center translate-x-[-50%] rotate-90 whitespace-nowrap text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--on-surface-dim)_54%,transparent)] transition-opacity duration-300"
                  style={{ opacity: isActive ? 0 : 1 }}
                >
                  {project.title}
                </span>
                <span
                  className="absolute inset-x-0 bottom-0 z-[3] block p-5 transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <span className="font-mono text-[0.68rem] tracking-tight text-[var(--secondary)]">
                    {padProjectNumber(index)} / {padProjectNumber(total)}
                  </span>
                  <span className="mt-3 block text-[0.88rem] font-medium leading-snug text-[var(--on-surface)]">
                    {project.title}
                  </span>
                  <span className="mt-1 block text-[0.66rem] font-medium uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                    {project.industry} / {project.location}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 flex min-h-20 flex-col gap-4 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] px-5 py-4 backdrop-blur-xl sm:px-8 md:right-[13.75rem] md:min-h-16 md:flex-row md:items-center md:gap-7 md:px-10 lg:right-[15rem] lg:px-20">
        <div className="hidden min-w-0 gap-5 overflow-x-auto md:flex">
          {showcaseProjects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              onClick={() => selectProject(index, true)}
              className="shrink-0 border-b py-1 text-left text-[0.72rem] font-medium uppercase tracking-[0.1em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
              style={{
                borderColor:
                  index === activeIndex ? "var(--secondary)" : "transparent",
                color:
                  index === activeIndex
                    ? "var(--primary)"
                    : "color-mix(in srgb, var(--on-surface-dim) 58%, transparent)",
              }}
            >
              {project.title}
            </button>
          ))}
        </div>
        <div className="h-px flex-1 overflow-hidden rounded-full bg-[var(--glass-border)]">
          <motion.div
            className="h-full rounded-full bg-[var(--gradient-brand)]"
            animate={{ width: progressWidth }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
        </div>
        <div className="flex justify-between gap-2 md:justify-start">
          <button
            type="button"
            onClick={() => goToPrevious(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_42%,transparent)] hover:text-[var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
            aria-label="Previous project"
          >
            <IconArrowLeft size={15} stroke={1.7} />
          </button>
          <button
            type="button"
            onClick={() => goToNext(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_42%,transparent)] hover:text-[var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
            aria-label="Next project"
          >
            <IconArrowRight size={15} stroke={1.7} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-20 right-[15.75rem] z-30 hidden items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--on-surface-dim)_44%,transparent)] lg:flex">
        <IconExternalLink size={15} stroke={1.5} />
        Switch project
      </div>
    </section>
  );
}
