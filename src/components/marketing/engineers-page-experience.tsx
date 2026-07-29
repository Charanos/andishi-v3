"use client";

/**
 * src/components/marketing/engineers-page-experience.tsx
 *
 * Flagship production-grade /engineers listing page experience:
 * - Ultra-clean 2-column header with serif typography & stat strip
 * - High-craft glass search input & compact Role Filter Dropdown popover
 * - Glassmorphic Engineer Profile Cards with larger avatars & max-contrast uppercase badges
 * - Exact Decarding technique on Mobile, Full Glass Cards on Desktop
 * - GSAP Power3 stagger entrance animations & custom cursor hover cues ("PROFILE")
 * - 100% monochrome editorial styling
 */

import { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconMapPin,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import type { Engineer } from "@/data/engineers";
import { engineerRoles } from "@/data/engineers";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RoleFilter = (typeof engineerRoles)[number];

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function domainLabel(domain: Engineer["domains"][number]) {
  const labels: Record<Engineer["domains"][number], string> = {
    ai: "AI / LLM",
    aws: "Cloud / AWS",
    fullstack: "Full-Stack",
    web3: "Web3",
  };
  return labels[domain];
}

function matchesRole(engineer: Engineer, role: RoleFilter) {
  if (role === "All") return true;

  const haystack =
    `${engineer.role} ${engineer.skills.join(" ")} ${engineer.domains.join(" ")}`.toLowerCase();

  if (role === "Full-Stack") {
    return engineer.domains.includes("fullstack") || haystack.includes("full-stack");
  }

  if (role === "AI/ML") {
    return (
      engineer.domains.includes("ai") ||
      haystack.includes("ai") ||
      haystack.includes("rag") ||
      haystack.includes("ml")
    );
  }

  if (role === "Cloud/AWS") {
    return (
      engineer.domains.includes("aws") ||
      haystack.includes("cloud") ||
      haystack.includes("aws") ||
      haystack.includes("terraform")
    );
  }

  return haystack.includes(role.toLowerCase());
}

function countForRole(engineers: Engineer[], role: RoleFilter) {
  return engineers.filter((engineer) => matchesRole(engineer, role)).length;
}

function PatternTexture({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3C/svg%3E\")",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Dropdown Popover Component
// ─────────────────────────────────────────────────────────────────────────────

function RoleDropdown({
  roles,
  value,
  onChange,
  counts,
}: {
  roles: readonly RoleFilter[];
  value: RoleFilter;
  onChange: (val: RoleFilter) => void;
  counts: (val: RoleFilter) => number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className={cn(
          "flex items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-[0.8rem] font-medium transition-all duration-200 min-w-[190px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]",
          value !== "All"
            ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)] shadow-md"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className="opacity-70 font-mono text-[0.72rem] uppercase">Role:</span>
          <strong className="font-medium truncate">
            {value === "All" ? "All Engineers" : value}
          </strong>
        </span>
        <IconChevronDown
          size={15}
          stroke={2}
          className={cn("shrink-0 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[240px] max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-high)] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
          >
            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
              {roles.map((role) => {
                const isActive = role === value;
                const count = counts(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      onChange(role);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[0.82rem] font-medium transition-all duration-150",
                      isActive
                        ? "bg-[var(--on-surface)] text-[var(--bg)]"
                        : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] hover:text-[var(--on-surface)]",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {isActive && <IconCheck size={14} className="shrink-0" />}
                      <span className="truncate">{role === "All" ? "All Engineers" : role}</span>
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[0.68rem] ml-2 shrink-0",
                        isActive ? "opacity-90" : "opacity-50",
                      )}
                    >
                      {count}
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

// ─────────────────────────────────────────────────────────────────────────────
// Production-Grade Engineer Card Component
// ─────────────────────────────────────────────────────────────────────────────

function EngineerCard({ engineer }: { engineer: Engineer }) {
  const availableNow = engineer.availability === "now";

  return (
    <article className="engineer-card flex h-full">
      <Link
        href={`/engineers/${engineer.slug}`}
        data-cursor-text="PROFILE"
        className={cn(
          "group/card flex w-full flex-col overflow-hidden text-left transition-all duration-500 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]",
          // Desktop: Rich Glass Card Container
          "md:rounded-[1.75rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:p-6 md:backdrop-blur-xl md:shadow-[var(--glass-inner-shadow)]",
          "md:hover:border-[color-mix(in_srgb,var(--on-surface)_35%,transparent)] md:hover:-translate-y-1.5 md:hover:shadow-[0_22px_56px_rgba(0,0,0,0.12)]",
          // Mobile: Decarding (border-bottom list item, no glass)
          "max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-8 max-md:last:!border-b-0 max-md:!translate-y-0",
        )}
      >
        {/* Top Header Row: Avatar, Name, Role & High-Contrast Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Prominent Developer Avatar Image */}
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border-2 border-[var(--glass-border)] bg-[var(--surface-high)] shadow-sm">
              <Image
                src={engineer.avatar}
                alt={engineer.name}
                fill
                sizes="64px"
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
              />
            </div>

            <div>
              <h3 className="title-serif text-[1.3rem] font-normal text-[var(--on-surface)] leading-tight group-hover/card:text-[var(--on-surface)] transition-colors">
                {engineer.name}
              </h3>
              <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] mt-0.5">
                {engineer.role}
              </p>
            </div>
          </div>

          {/* Max-Contrast Uppercase Availability Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wider shrink-0 font-medium shadow-sm",
              availableNow
                ? "border-emerald-800/80 bg-emerald-950 text-emerald-200 dark:border-emerald-500/50 dark:bg-emerald-950/80 dark:text-emerald-300"
                : "border-[var(--outline)] bg-[var(--surface-high)] text-[var(--on-surface-dim)]",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                availableNow
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-[var(--on-surface-dim)] opacity-40",
              )}
            />
            {availableNow ? "AVAILABLE NOW" : "ALLOCATED"}
          </span>
        </div>

        {/* Bio / Narrative */}
        <p className="line-clamp-2 text-[0.88rem] text-[var(--on-surface-dim)] leading-relaxed mb-5 font-normal">
          {engineer.bio}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {engineer.domains.map((dom) => (
            <span
              key={dom}
              className="rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] px-2.5 py-0.5 font-mono text-[0.68rem] text-[var(--on-surface)]"
            >
              {domainLabel(dom)}
            </span>
          ))}
          {engineer.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-[var(--outline)] bg-transparent px-2.5 py-0.5 font-mono text-[0.68rem] text-[var(--on-surface-dim)]"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Footer Row: Location, Experience & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)] max-md:border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[0.75rem] text-[var(--on-surface-dim)]">
              <IconMapPin size={13} />
              <span>
                {engineer.location.city}, {engineer.location.country}
              </span>
            </div>
            <span className="text-[var(--on-surface-dim)] opacity-30">•</span>
            <span className="font-mono text-[0.75rem] text-[var(--on-surface)] font-medium">
              {engineer.yearsExp} yrs exp
            </span>
          </div>

          <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover/card:border-[var(--on-surface)] group-hover/card:bg-[var(--on-surface)] group-hover/card:text-[var(--bg)]">
            <IconArrowRight
              size={14}
              className="-rotate-45 transition-transform group-hover/card:rotate-0"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public EngineersPageExperience Component
// ─────────────────────────────────────────────────────────────────────────────

export function EngineersPageExperience({ engineers }: { engineers: Engineer[] }) {
  const [activeRole, setActiveRole] = useState<RoleFilter>("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const availableCount = useMemo(
    () => engineers.filter((engineer) => engineer.availability === "now").length,
    [engineers],
  );

  const filteredEngineers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return engineers.filter((engineer) => {
      const matchesAvailability = !availableOnly || engineer.availability === "now";
      const matchesSearch =
        !query ||
        [
          engineer.name,
          engineer.role,
          engineer.skills.join(" "),
          engineer.location.city,
          engineer.location.country,
          engineer.highlights.join(" "),
          engineer.domains.map(domainLabel).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesRole(engineer, activeRole) && matchesAvailability && matchesSearch;
    });
  }, [activeRole, availableOnly, engineers, search]);

  // Refined Power3 GSAP entrance animation
  useEffect(() => {
    if (!gridRef.current || filteredEngineers.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".engineer-card",
        { opacity: 0, y: 32, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.04,
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filteredEngineers]);

  const hasActiveFilters = activeRole !== "All" || availableOnly || search.length > 0;

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <CustomCursorRegion className="relative isolate">
        <PatternTexture opacity={0.04} />

        {/* Subtle top background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--surface-high)_12%,transparent),transparent)]"
        />

        <div className="relative z-[1] flex w-full flex-col pb-24 pt-28 lg:pt-32">
          {/* ── Hero Section ─────────────────────────────────────────── */}
          <section className="w-full px-5 sm:px-8 lg:px-10 mb-8">
            <div className="mx-auto w-full max-w-[92rem]">
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0 }}
                className="label-caps mb-4 flex items-center gap-2.5 text-[var(--on-surface-dim)]"
              >
                <span className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40" />
                Vetted Talent Network · {engineers.length} Senior Engineers
              </motion.p>

              {/* Header Title & Available Counter Grid */}
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.06 }}
                  className="title-serif text-[clamp(3.2rem,7.5vw,5.5rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]"
                >
                  The Network.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.12 }}
                  className="lg:text-right"
                >
                  <p className="font-mono text-[clamp(2.8rem,6vw,4.5rem)] font-medium leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface)_18%,transparent)]">
                    {formatIndex(availableCount - 1)}
                  </p>
                  <p className="mt-3 max-w-xs text-[0.88rem] leading-[1.6] text-[var(--on-surface-dim)] lg:ml-auto">
                    Senior pre-vetted engineers across full-stack, AI, cloud, Web3, and mobile
                    systems. Ready for immediate deployment.
                  </p>
                </motion.div>
              </div>

              {/* Stat strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.18 }}
                className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[var(--glass-border)] pt-7"
              >
                {[
                  { value: "50+", label: "Engineers in Network" },
                  { value: "8%", label: "Acceptance Rate" },
                  { value: "6+ yrs", label: "Avg Experience" },
                  { value: "100%", label: "Pre-Vetted Bar" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[1.2rem] font-medium text-[var(--on-surface)]">
                      {stat.value}
                    </span>
                    <span className="text-[0.75rem] font-mono text-[var(--on-surface-dim)] uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── High-Craft Compact Filter & Search Trigger Bar ─────────── */}
          <div className="sticky top-[4rem] sm:top-[4.5rem] z-[40] w-full border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-5 py-3 backdrop-blur-xl sm:px-8 lg:px-10 mb-10">
            <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search Bar Input */}
                <div className="relative flex-1 sm:w-80">
                  <IconSearch
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, skill, country..."
                    className="h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-10 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--on-surface)] backdrop-blur-xl transition-all placeholder:text-[var(--on-surface-dim)] opacity-80 focus:opacity-100"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                    >
                      <IconX size={13} />
                    </button>
                  )}
                </div>

                {/* Role Dropdown Popover */}
                <RoleDropdown
                  roles={engineerRoles}
                  value={activeRole}
                  onChange={setActiveRole}
                  counts={(r) => countForRole(engineers, r)}
                />

                {/* High Contrast Available Now Switch */}
                <button
                  type="button"
                  onClick={() => setAvailableOnly((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.72rem] uppercase tracking-wider transition-all duration-200 font-medium",
                    availableOnly
                      ? "border-emerald-800/80 bg-emerald-950 text-emerald-200 dark:border-emerald-500/50 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-sm"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      availableOnly ? "bg-emerald-400 animate-pulse" : "bg-[var(--on-surface-dim)]",
                    )}
                  />
                  <span>AVAILABLE NOW</span>
                </button>
              </div>

              {/* Counter & Reset Filter Trigger */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <span className="font-mono text-[0.75rem] text-[var(--on-surface-dim)]">
                  Showing <strong>{filteredEngineers.length}</strong> engineer
                  {filteredEngineers.length !== 1 ? "s" : ""}
                </span>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setActiveRole("All");
                      setAvailableOnly(false);
                      setSearch("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] px-3 py-1 font-mono text-[0.7rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors"
                  >
                    <IconX size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Showcase Section ────────────────────────────────────────── */}
          <section className="w-full px-5 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[92rem]">
              {/* Empty state */}
              <AnimatePresence mode="wait">
                {filteredEngineers.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-24 text-center"
                  >
                    <p className="text-[0.9rem] text-[var(--on-surface-dim)]">
                      No engineers match this search or filter combination.
                    </p>
                    <button
                      onClick={() => {
                        setActiveRole("All");
                        setAvailableOnly(false);
                        setSearch("");
                      }}
                      className="mt-4 font-mono text-[0.82rem] text-[var(--on-surface)] underline underline-offset-4"
                    >
                      Reset all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uniform Engineer Showcase Grid */}
              {filteredEngineers.length > 0 && (
                <div
                  ref={gridRef}
                  key={`${activeRole}-${availableOnly}-${search}`}
                  className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6"
                >
                  {filteredEngineers.map((engineer) => (
                    <EngineerCard key={engineer.slug} engineer={engineer} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </CustomCursorRegion>
    </main>
  );
}
