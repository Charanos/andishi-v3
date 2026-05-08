"use client";

import {
  IconArrowRight,
  IconExternalLink,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { workFilters, workProjects, type WorkProject } from "@/content/work";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring } from "@/lib/motion";

type FilterValue = (typeof workFilters)[number]["value"];

const cardHeights: Record<WorkProject["imageHeight"], string> = {
  short: "h-44",
  mid: "h-56",
  tall: "h-72",
};

const statusStyles: Record<WorkProject["status"], string> = {
  Live: "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_16%,transparent)] text-[var(--tertiary)]",
  Shipped:
    "border-[color-mix(in_srgb,var(--secondary)_30%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] text-[var(--secondary)]",
  Beta: "border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
};

function getMetricColor(tone: WorkProject["metrics"][number]["tone"]) {
  if (tone === "cyan") return "var(--secondary)";
  if (tone === "success") return "var(--tertiary)";
  if (tone === "primary") return "var(--primary)";
  return "var(--on-surface)";
}

function countForFilter(value: FilterValue) {
  if (value === "all") return workProjects.length;
  return workProjects.filter((project) => project.sector === value).length;
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function PatternTexture({
  className = "",
  opacity = 0.16,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 10.5v7M10.5 14h7' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.24'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 18%, transparent) 0 1px, transparent 1.7px)",
        backgroundPosition: "0 0, 14px 14px",
        backgroundSize: "28px 28px, 28px 28px",
      }}
    />
  );
}

export function WorkPageExperience() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(
    null,
  );

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return workProjects;
    return workProjects.filter((project) => project.sector === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    if (!selectedProject) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedProject]);

  return (
    <>
      <main className="relative isolate overflow-visible bg-[var(--bg)]">
        <CustomCursorRegion className="relative isolate">
          <PatternTexture className="z-0" opacity={0.1} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
          />

          <div className="relative z-[1] mx-auto flex w-full max-w-[96rem] items-start gap-0 px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pt-36">
          <aside className="sticky top-28 hidden max-h-[calc(100svh-8rem)] w-56 shrink-0 flex-col justify-between self-start overflow-y-auto border-r border-[var(--glass-border)] pr-5 xl:flex">
            <div>
              <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                Filter by sector
              </p>
              <div className="space-y-1">
                {workFilters.map((filter) => {
                  const isActive = activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[0.88rem] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                      style={{
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                          : "transparent",
                        color: isActive
                          ? "var(--primary)"
                          : "var(--on-surface-dim)",
                      }}
                    >
                      {filter.label}
                      <span className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,currentColor_66%,transparent)]">
                        {countForFilter(filter.value)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["50+", "engineers placed globally"],
                ["48h", "to first matched profiles"],
                ["30d", "post-launch support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl"
                >
                  <p className="font-mono text-[1.45rem] leading-none tracking-normal text-[var(--on-surface)]">
                    {value}
                  </p>
                  <p className="mt-2 text-[0.72rem] leading-snug text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 xl:pl-10">
            <header className="mb-10 border-b border-[var(--glass-border)] pb-8 md:mb-12 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cosmicSpring}
              >
                <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                  <span className="h-px w-7 bg-[var(--secondary)]" />
                  Selected work / 2023-2026
                </p>
                <h1 className="m-0 text-[clamp(3rem,11vw,6.2rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
                  Our Work.
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.08 }}
                className="mt-6 max-w-md md:mt-0 md:text-right"
              >
                <p className="font-mono text-[clamp(3rem,7vw,5rem)] leading-none tracking-normal text-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] dark:text-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]">
                  {formatIndex(workProjects.length - 1)}
                </p>
                <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                  Proof of what Andishi engineers have shipped across fintech,
                  education, logistics, analytics, APIs, and operational
                  products.
                </p>
              </motion.div>
            </header>

            <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-[var(--on-surface-dim)] xl:hidden">
                <IconFilter size={15} stroke={1.6} />
                Filter
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workFilters.map((filter) => {
                  const isActive = activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className="shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                      style={{
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                          : "var(--glass-bg)",
                        borderColor: isActive
                          ? "color-mix(in srgb, var(--primary) 34%, transparent)"
                          : "var(--glass-border)",
                        color: isActive
                          ? "var(--primary)"
                          : "var(--on-surface-dim)",
                      }}
                    >
                      {filter.label.replace(" projects", "")}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="columns-1 gap-5 lg:columns-2"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  index={index}
                  project={project}
                  onOpen={() => setSelectedProject(project)}
                />
              ))}
            </motion.div>

            <section className="relative mt-20 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:mt-24 lg:px-16 lg:py-16">
              <FinalCtaArtwork />
              <PatternTexture opacity={0.12} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 left-8 h-28 w-44 rotate-[-8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] opacity-40"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 top-8 h-32 w-52 rotate-[8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] opacity-35"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Ready to meet the engineer behind your next build?
                </p>
                <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.04] tracking-normal text-[var(--on-surface)]">
                  Your startup can be next in the match queue.
                </h2>
                <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                  Tell us your stack, bottleneck, and timeline. We will surface
                  matched senior African engineers if the right fit is active.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start matching
                    <IconArrowRight size={15} stroke={2} />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    See our services
                  </Link>
                </div>
              </div>
            </section>
          </div>
          </div>
        </CustomCursorRegion>
      </main>

      <CaseStudyDrawer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

function ProjectCard({
  index,
  onOpen,
  project,
}: {
  index: number;
  onOpen: () => void;
  project: WorkProject;
}) {
  const isFeatured = project.featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...cosmicSpring, delay: Math.min(index * 0.04, 0.22) }}
      className={
        isFeatured
          ? "mb-5 break-inside-avoid lg:[column-span:all]"
          : "mb-5 break-inside-avoid"
      }
    >
      <button
        type="button"
        onClick={onOpen}
        className={`group/card grid w-full overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] text-left shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)] ${
          isFeatured ? "lg:grid-cols-[1.05fr_0.95fr]" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            isFeatured
              ? "min-h-72 lg:min-h-full"
              : cardHeights[project.imageHeight]
          }`}
        >
          <Image
            src={project.image}
            alt={`${project.title} project preview`}
            fill
            sizes={
              isFeatured
                ? "(min-width: 1024px) 42vw, 100vw"
                : "(min-width: 1024px) 36vw, 100vw"
            }
            className="object-cover brightness-[0.78] saturate-[0.78] transition duration-700 group-hover/card:scale-105 group-hover/card:brightness-[0.92] group-hover/card:saturate-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_82%,transparent),transparent_52%)]" />
          <span className="absolute left-4 top-4 rounded-lg bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-2.5 py-1 font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_68%,transparent)] backdrop-blur-xl">
            {formatIndex(index)}
          </span>
          <span
            className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[0.64rem] font-medium ${statusStyles[project.status]}`}
          >
            {project.status === "Live" ? "Live" : project.status}
          </span>
        </div>

        <div className={`p-5 sm:p-6 ${isFeatured ? "lg:p-9" : ""}`}>
          <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
            {project.sectorLabel}
          </p>
          <h2
            className={`font-medium leading-tight tracking-normal text-[var(--on-surface)] ${
              isFeatured ? "text-[clamp(1.5rem,3vw,2rem)]" : "text-[1.15rem]"
            }`}
          >
            {project.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-[0.9rem] leading-[1.65] text-[var(--on-surface-dim)]">
            {project.description}
          </p>

          {isFeatured && (
            <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)]">
              {project.metrics.slice(0, 3).map((metric) => (
                <div
                  key={metric.label}
                  className="border-r border-[var(--glass-border)] px-4 py-3 last:border-r-0"
                >
                  <p
                    className="font-mono text-[1rem] tracking-normal"
                    style={{ color: getMetricColor(metric.tone) }}
                  >
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tags.slice(0, isFeatured ? 5 : 3).map((tag, tagIndex) => (
              <span
                key={tag}
                className="rounded-full border px-2.5 py-1 text-[0.7rem] font-medium"
                style={{
                  backgroundColor:
                    tagIndex === 0
                      ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                      : "var(--glass-bg)",
                  borderColor:
                    tagIndex === 0
                      ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
                      : "var(--glass-border)",
                  color:
                    tagIndex === 0
                      ? "var(--secondary)"
                      : "var(--on-surface-dim)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--glass-border)] pt-5">
            <div>
              <p className="font-mono text-[1rem] tracking-normal text-[var(--on-surface)]">
                {project.metric}
              </p>
              <p className="mt-1 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                {project.metricLabel}
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover/card:rotate-0 group-hover/card:border-[color-mix(in_srgb,var(--secondary)_38%,transparent)] group-hover/card:text-[var(--secondary)]">
              <IconArrowRight size={15} stroke={1.7} />
            </span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

function CaseStudyDrawer({
  onClose,
  project,
}: {
  onClose: () => void;
  project: WorkProject | null;
}) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.button
            type="button"
            aria-label="Close case study"
            className="fixed inset-0 z-[80] cursor-default bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            className="fixed bottom-0 left-1/2 z-[90] max-h-[90vh] w-[min(58rem,calc(100vw-1rem))] -translate-x-1/2 overflow-y-auto rounded-t-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_-28px_90px_color-mix(in_srgb,var(--bg-deep)_70%,transparent)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-5 py-4 backdrop-blur-2xl sm:px-7">
              <span className="h-1 w-10 rounded-full bg-[color-mix(in_srgb,var(--on-surface-dim)_34%,transparent)]" />
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_38%,transparent)] hover:text-[var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                aria-label="Close case study"
              >
                <IconX size={17} stroke={1.7} />
              </button>
            </div>

            <div className="relative h-64 overflow-hidden sm:h-80">
              <Image
                src={project.image}
                alt={`${project.title} project preview`}
                fill
                sizes="min(58rem, 100vw)"
                className="object-cover brightness-[0.82] saturate-[0.86]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--surface),transparent_58%)]" />
            </div>

            <div className="px-5 pb-10 pt-2 sm:px-8 sm:pb-12">
              <p className="label-caps mb-3 text-[var(--secondary)]">
                {project.sectorLabel} / {project.location}
              </p>
              <h2
                id="case-study-title"
                className="max-w-2xl text-[clamp(2rem,6vw,3rem)] font-normal leading-[1.06] tracking-normal text-[var(--on-surface)]"
              >
                {project.title}
              </h2>
              <p className="body-md mt-5 max-w-3xl text-[var(--on-surface-dim)]">
                {project.description}
              </p>

              <div className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-4">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="border-b border-[var(--glass-border)] px-4 py-4 sm:border-b-0 sm:border-r last:border-b-0 sm:last:border-r-0"
                  >
                    <p
                      className="font-mono text-[1.25rem] tracking-normal"
                      style={{ color: getMetricColor(metric.tone) }}
                    >
                      {metric.value}
                    </p>
                    <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  ["Challenge", project.challenge],
                  ["Solution", project.solution],
                ].map(([label, text]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl"
                  >
                    <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                      {label}
                    </p>
                    <p className="text-[0.9rem] leading-[1.7] text-[var(--on-surface-dim)]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1.5 text-[0.74rem] font-medium"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                          : "var(--glass-bg)",
                      borderColor:
                        index === 0
                          ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
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
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-3.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Hire talent like this
                  <IconExternalLink size={15} stroke={1.8} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[3.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-3.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Back to work
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
