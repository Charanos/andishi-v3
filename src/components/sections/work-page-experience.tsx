"use client";

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { workProjects, type WorkProject } from "@/content/work";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { mapApiProjectToWorkProject } from "@/lib/work-mapper";

function getMetricColor(tone: WorkProject["metrics"][number]["tone"]) {
  if (tone === "cyan") return "var(--secondary)";
  if (tone === "success") return "var(--tertiary)";
  if (tone === "primary") return "var(--primary)";
  return "var(--on-surface)";
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

const serviceFilters = [
  { label: "All Services", value: "all" },
  { label: "Web Applications", value: "custom-software" },
  { label: "SaaS Platforms", value: "saas-development" },
  { label: "AI Systems", value: "ai-systems" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "Enterprise Software", value: "enterprise-software" },
  { label: "Blockchain / Web3", value: "blockchain" },
  { label: "APIs & Integrations", value: "apis-integrations" },
  { label: "Product Strategy", value: "product-strategy" },
] as const;

const verticalFilters = [
  { label: "All Industries", value: "all" },
  { label: "Fintech", value: "fintech" },
  { label: "EdTech", value: "edtech" },
  { label: "Logistics", value: "logistics" },
  { label: "SaaS", value: "saas" },
  { label: "Retail / Commerce", value: "retail" },
] as const;

// Custom Dropdown Component
function FilterDropdown({
  label,
  options,
  value,
  onChange,
  counts,
}: {
  label: string;
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  counts: (val: string) => number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-[0.82rem] font-medium transition-all hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-w-[200px]"
      >
        <span className="text-[var(--on-surface-dim)]">
          {label}:{" "}
          <strong className="text-[var(--on-surface)] font-medium ml-1">
            {selectedOption.label}
          </strong>
        </span>
        <IconChevronDown
          size={16}
          stroke={1.8}
          className={cn(
            "text-[var(--on-surface-dim)] transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[260px] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-high)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
          >
            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[0.82rem] font-medium transition-all duration-200",
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
                        : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] hover:text-[var(--on-surface)]",
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        "font-mono text-[0.68rem] tracking-tight",
                        isActive ? "opacity-100" : "opacity-50",
                      )}
                    >
                      {counts(option.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const handleScrollToTop = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => handleScrollToTop(currentPage - 1)}
        disabled={currentPage === 1}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-30 disabled:hover:border-[var(--glass-border)] disabled:hover:text-[var(--on-surface-dim)]"
        aria-label="Previous page"
      >
        <IconChevronLeft size={18} stroke={2} />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;

        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <button
              key={page}
              onClick={() => handleScrollToTop(page)}
              className={cn(
                "grid h-10 min-w-10 px-2 place-items-center rounded-full border text-[0.85rem] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                isActive
                  ? "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] text-[var(--on-surface-dim)] hover:text-[var(--primary)]",
              )}
            >
              {page}
            </button>
          );
        }

        if (page === currentPage - 2 || page === currentPage + 2) {
          return (
            <span key={page} className="text-[var(--on-surface-dim)] px-1">
              ...
            </span>
          );
        }

        return null;
      })}

      <button
        type="button"
        onClick={() => handleScrollToTop(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-30 disabled:hover:border-[var(--glass-border)] disabled:hover:text-[var(--on-surface-dim)]"
        aria-label="Next page"
      >
        <IconChevronRight size={18} stroke={2} />
      </button>
    </div>
  );
}

export function WorkPageExperience() {
  const [activeService, setActiveService] = useState<string>("all");
  const [activeVertical, setActiveVertical] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
  const [dbProjects, setDbProjects] = useState<WorkProject[]>([]);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchWork() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (activeService !== "all") query.set("service", activeService);
        if (activeVertical !== "all") query.set("vertical", activeVertical);

        const res = await fetch(`/api/work?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.work && data.work.length > 0) {
            setDbProjects(data.work.map(mapApiProjectToWorkProject));
          } else {
            setDbProjects([]);
          }
        }
      } catch (err) {
        console.error("Error fetching work projects from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWork();
  }, [activeService, activeVertical]);

  const filteredProjects = useMemo(() => {
    if (dbProjects.length > 0) return dbProjects;

    return workProjects.filter((project) => {
      const matchService =
        activeService === "all" ||
        project.tags.some((t) => t.toLowerCase().includes(activeService)) ||
        project.sector === activeService;
      const matchVertical = activeVertical === "all" || project.sector === activeVertical;
      return matchService && matchVertical;
    });
  }, [dbProjects, activeService, activeVertical]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

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

  useEffect(() => {
    if (!gridRef.current || paginatedProjects.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".project-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.065,
          ease: "power2.out",
          delay: 0.05,
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [paginatedProjects, loading]);

  const countForService = (val: string) => {
    if (dbProjects.length > 0) {
      if (val === "all") return dbProjects.length;
      return dbProjects.filter(
        (p) => p.tags.some((t) => t.toLowerCase().includes(val)) || p.sector === val,
      ).length;
    }
    if (val === "all") return workProjects.length;
    return workProjects.filter(
      (project) =>
        project.tags.some((t) => t.toLowerCase().includes(val)) || project.sector === val,
    ).length;
  };

  const countForVertical = (val: string) => {
    if (dbProjects.length > 0) {
      if (val === "all") return dbProjects.length;
      return dbProjects.filter((p) => p.sector === val).length;
    }
    if (val === "all") return workProjects.length;
    return workProjects.filter((project) => project.sector === val).length;
  };

  return (
    <>
      <main className="relative isolate overflow-visible bg-[var(--bg)]">
        <CustomCursorRegion className="relative isolate">
          <PatternTexture className="z-0" opacity={0.1} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
          />

          <div className="relative z-[1] mx-auto flex w-full max-w-[92rem] flex-col pb-24 pt-32 lg:pt-36">
            <header className="mb-8 px-5 sm:px-8 lg:px-10 md:mb-12 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cosmicSpring}
              >
                <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                  <span className="h-px w-7 bg-[var(--secondary)]" />
                  Selected work / 2024-2026
                </p>
                <h1 className="title-serif m-0 text-[clamp(3.15rem,7.4vw,5.25rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                  Our Work.
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.08 }}
                className="mt-6 max-w-md md:mt-0 md:text-right"
              >
                <p className="font-mono text-[clamp(3rem,7vw,5rem)] font-medium leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] dark:text-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]">
                  {formatIndex(filteredProjects.length)}
                </p>
                <p className="body-md mt-3 font-medium text-[var(--on-surface-dim)]">
                  Proof of our software delivery work across fintech, SaaS platforms, logistics, AI
                  integrations, and mobile systems.
                </p>
              </motion.div>
            </header>

            <div className="sticky top-[4.5rem] z-[40] border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] px-5 py-4 backdrop-blur-xl transition-all duration-300 sm:px-8 lg:px-10 mb-6">
              <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-4 sm:flex-row sm:items-center">
                <FilterDropdown
                  label="Service"
                  options={serviceFilters}
                  value={activeService}
                  onChange={(val) => {
                    setActiveService(val);
                    setCurrentPage(1);
                  }}
                  counts={countForService}
                />
                <FilterDropdown
                  label="Industry"
                  options={verticalFilters}
                  value={activeVertical}
                  onChange={(val) => {
                    setActiveVertical(val);
                    setCurrentPage(1);
                  }}
                  counts={countForVertical}
                />
              </div>
            </div>

            <div className="px-5 sm:px-8 lg:px-10">
              <div
                ref={gridRef}
                key={`${activeService}-${activeVertical}-${currentPage}`}
                className={cn(
                  "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr",
                  loading && "opacity-35 transition-opacity duration-300",
                )}
              >
                {paginatedProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    index={(currentPage - 1) * itemsPerPage + index}
                    project={project}
                    onOpen={() => setSelectedProject(project)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </CustomCursorRegion>
      </main>

      <CaseStudyDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
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
    <article
      className={cn(
        "project-card break-inside-avoid flex h-full",
        isFeatured ? "lg:col-span-2" : "",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor-text="VIEW"
        className={cn(
          "group/card cursor-pointer flex w-full overflow-hidden text-left transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]",
          "rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:shadow-[0_22px_56px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] hover:-translate-y-[3px]",
          "max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-10 max-md:last:!border-b-0 max-md:!translate-y-0",
          isFeatured ? "flex-col lg:flex-row" : "flex-col",
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden",
            "max-md:rounded-[1.25rem] max-md:mb-4",
            isFeatured
              ? "w-full lg:w-[55%] aspect-[4/3] lg:aspect-auto h-full"
              : "w-full aspect-[4/3]",
          )}
        >
          <Image
            src={project.image}
            alt={`${project.title} project preview`}
            fill
            sizes={
              isFeatured
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            }
            className="object-cover transition duration-700 group-hover/card:scale-[1.04]"
          />
          {/* Dark gradient mask for professional contrast on light and dark mode */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

          <span className="absolute left-4 top-4 rounded-lg bg-[rgba(255,255,255,0.15)] px-2.5 py-1 font-mono text-[0.68rem] font-medium tracking-tight text-white backdrop-blur-xl border border-[rgba(255,255,255,0.1)]">
            {formatIndex(index)}
          </span>
          <span
            className={`absolute right-4 top-4 rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1 text-[0.64rem] font-medium text-white backdrop-blur-xl`}
          >
            {project.status === "Live" ? "Live" : project.status}
          </span>

          {/* Sector and Title overlayed on image for punchy look */}
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <p className="label-caps mb-2 text-white/70">{project.sectorLabel}</p>
            <h2
              className={cn(
                "font-medium leading-tight tracking-tight text-white",
                isFeatured ? "text-[clamp(1.5rem,3vw,2rem)]" : "text-[1.25rem]",
              )}
            >
              {project.title}
            </h2>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col flex-1 max-md:px-2",
            isFeatured ? "p-5 sm:p-6 lg:w-[45%] lg:p-8 lg:justify-center" : "p-5 sm:p-6",
          )}
        >
          <p
            className={cn(
              "font-medium text-[var(--on-surface-dim)]",
              isFeatured
                ? "text-[0.95rem] leading-[1.7]"
                : "line-clamp-3 text-[0.9rem] leading-[1.65]",
            )}
          >
            {project.description}
          </p>

          {isFeatured && (
            <div className="mt-8 grid grid-cols-2 gap-4 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)]">
              {project.metrics.slice(0, 4).map((metric) => (
                <div
                  key={metric.label}
                  className="px-4 py-3 border-[var(--glass-border)] odd:border-r [&:nth-child(-n+2)]:border-b"
                >
                  <p
                    className="font-mono text-[1.05rem] tracking-tight"
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

          <div className={cn("flex flex-wrap gap-1.5", isFeatured ? "mt-8" : "mt-auto pt-6")}>
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
                  color: tagIndex === 0 ? "var(--secondary)" : "var(--on-surface-dim)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            className={cn(
              "flex items-center justify-between border-[var(--glass-border)] max-md:border-transparent",
              isFeatured ? "mt-8 border-t pt-6" : "mt-6 border-t pt-5",
            )}
          >
            <div>
              <p className="font-mono text-[1rem] tracking-tight text-[var(--on-surface)]">
                {project.metric}
              </p>
              <p className="mt-1 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                {project.metricLabel}
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:border-[color-mix(in_srgb,var(--secondary)_38%,transparent)] group-hover/card:text-[var(--secondary)]">
              <IconArrowRight size={15} stroke={1.7} className="-rotate-45" />
            </span>
          </div>
        </div>
      </button>
    </article>
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

            <div className="relative h-64 overflow-hidden sm:h-[26rem] flex items-end p-5 sm:p-10 group/hero">
              <Image
                src={project.image}
                alt={`${project.title} project preview`}
                fill
                sizes="min(58rem, 100vw)"
                className="object-cover brightness-[0.6] saturate-[0.8] transition-transform duration-1000 group-hover/hero:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--surface),transparent_80%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--surface)_90%,transparent),transparent_60%)]" />

              <div className="relative z-10 w-full max-w-2xl">
                <p className="label-caps mb-3 text-[var(--secondary)]">
                  {project.sectorLabel} / {project.location}
                </p>
                <h2
                  id="case-study-title"
                  className="title-serif text-[clamp(2.12rem,4.2vw,3.5rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]"
                >
                  {project.title}
                </h2>
              </div>
            </div>

            <div className="px-5 pb-10 pt-6 sm:px-10 sm:pb-12">
              <p className="body-md mb-12 max-w-3xl font-medium text-[var(--on-surface-dim)] leading-[1.8]">
                {project.description}
              </p>

              <div className="mb-12 grid gap-6 md:grid-cols-2">
                {[
                  ["The Challenge", project.challenge],
                  ["The Solution", project.solution],
                ].map(([label, text]) => (
                  <div
                    key={label}
                    className="group/box relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_30%,transparent)] hover:shadow-[0_22px_44px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
                  >
                    <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-b from-[var(--secondary)] to-transparent opacity-0 transition-opacity duration-300 group-hover/box:opacity-[0.04]" />
                    <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                      {label}
                    </p>
                    <p className="text-[0.95rem] font-medium leading-[1.75] text-[var(--on-surface-dim)]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Data Visualization Section */}
              <div className="mb-12 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 sm:p-8 backdrop-blur-xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium tracking-tight text-[var(--on-surface)] mb-1">
                      Project Impact & Growth
                    </h3>
                    <p className="text-sm font-medium text-[var(--on-surface-dim)]">
                      Measured key performance indicators over 6 months
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-3 py-1.5 text-xs font-mono">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                    Live Data Simulation
                  </div>
                </div>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: "Jan", impact: 10 },
                        { month: "Feb", impact: 25 },
                        { month: "Mar", impact: 45 },
                        { month: "Apr", impact: 60 },
                        { month: "May", impact: 85 },
                        { month: "Jun", impact: 110 },
                      ]}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="color-mix(in srgb, var(--on-surface) 6%, transparent)"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--on-surface-dim)", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--on-surface-dim)", fontSize: 12, fontWeight: 500 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface)",
                          borderRadius: "12px",
                          border: "1px solid var(--glass-border)",
                          boxShadow:
                            "0 10px 24px color-mix(in srgb, var(--bg-deep) 40%, transparent)",
                          color: "var(--on-surface)",
                          fontWeight: 500,
                        }}
                        itemStyle={{ color: "var(--primary)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="impact"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorImpact)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-px bg-[var(--glass-border)] sm:grid-cols-4 rounded-xl overflow-hidden border border-[var(--glass-border)]">
                  {project.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-[var(--glass-bg)] px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_60%,transparent)]"
                    >
                      <p
                        className="font-mono text-[1.35rem] tracking-tight mb-1"
                        style={{ color: getMetricColor(metric.tone) }}
                      >
                        {metric.value}
                      </p>
                      <p className="text-[0.62rem] font-medium uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
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
                      color: index === 0 ? "var(--secondary)" : "var(--on-surface-dim)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={buildWhatsAppUrl(undefined, { context: `Work: ${project.title}` })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-7 py-3.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--bg-deep)_46%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Start a Project like this
                  <IconBrandWhatsapp size={15} stroke={1.8} />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[3.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-7 py-3.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
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
