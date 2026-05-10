"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowRight,
  IconClock,
  IconFilter,
  IconMapPin,
  IconSearch,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import type { Engineer } from "@/data/engineers";
import { engineerRoles } from "@/data/engineers";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RoleFilter = (typeof engineerRoles)[number];

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function timezoneText(offset: number) {
  if (offset === 0) return "UTC+0";
  return `UTC${offset > 0 ? "+" : ""}${offset}`;
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
    return (
      engineer.domains.includes("fullstack") || haystack.includes("full-stack")
    );
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

function availabilityText(engineer: Engineer) {
  if (engineer.availability === "now") return "Available now";

  return `From ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(engineer.availability))}`;
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
      className={cn("pointer-events-none absolute inset-0", className)}
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

function AvailabilityBadge({ engineer }: { engineer: Engineer }) {
  const availableNow = engineer.availability === "now";

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-xl",
        availableNow
          ? "border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
          : "border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]",
      )}
    >
      <span
        className={cn(
          "h-[6px] w-[6px] rounded-full",
          availableNow
            ? "bg-[var(--tertiary)] shadow-[0_0_8px_var(--tertiary)]"
            : "bg-[var(--secondary)]",
        )}
        aria-hidden="true"
      />
      <span className="text-[0.62rem] font-medium">
        {availabilityText(engineer)}
      </span>
    </span>
  );
}

function EngineerCard({
  engineer,
  index,
}: {
  engineer: Engineer;
  index: number;
}) {
  const visibleSkills = engineer.skills.slice(0, 4);
  const extraSkillCount = engineer.skills.length - visibleSkills.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...cosmicSpring, delay: Math.min(index * 0.04, 0.22) }}
      className="mb-5 break-inside-avoid"
    >
      <Link
        href={`/engineers/${engineer.slug}`}
        className="group/card relative w-full overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] text-left shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
        aria-label={`View profile: ${engineer.name}, ${engineer.role}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_55%,transparent),transparent)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        />

        <div className="relative h-36 overflow-hidden bg-[var(--surface-high)]">
          <Image
            src={engineer.avatar}
            alt={`${engineer.name} profile photo`}
            fill
            sizes="(min-width: 1280px) 24vw, (min-width: 640px) 44vw, 100vw"
            className="object-cover brightness-[0.82] saturate-[0.88] transition duration-700 group-hover/card:scale-105 group-hover/card:brightness-[0.95] group-hover/card:saturate-100"
          />
          <PatternTexture opacity={0.08} />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_78%,transparent),transparent_58%)]" />

          <span className="absolute left-4 top-4 rounded-lg bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-2.5 py-1 font-mono text-[0.68rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface)_68%,transparent)] backdrop-blur-xl">
            {formatIndex(index)}
          </span>
          <span className="absolute right-4 top-4">
            <AvailabilityBadge engineer={engineer} />
          </span>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface)_74%,transparent)]">
                {engineer.domains.map(domainLabel).join(" / ")}
              </p>
              <h2 className="truncate text-[1.18rem] font-medium leading-tight tracking-tight text-[var(--on-surface)]">
                {engineer.name}
              </h2>
            </div>
            {engineer.featured && (
              <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-2.5 py-1 font-mono text-[0.62rem] text-[var(--secondary)] backdrop-blur-xl">
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <p className="text-[0.88rem] text-[var(--on-surface-dim)]">
            {engineer.role}
          </p>

          <p className="mt-3 line-clamp-2 text-[0.86rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface-dim)_78%,transparent)]">
            {engineer.highlights[0]}
          </p>

          <div
            className="mt-4 flex flex-wrap gap-1.5"
            role="list"
            aria-label={`${engineer.name} skills`}
          >
            {visibleSkills.map((skill, skillIndex) => (
              <span
                key={skill}
                role="listitem"
                className="rounded-full border px-2.5 py-1 text-[0.7rem] font-medium"
                style={{
                  backgroundColor:
                    skillIndex === 0
                      ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                      : "var(--glass-bg)",
                  borderColor:
                    skillIndex === 0
                      ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
                      : "var(--glass-border)",
                  color:
                    skillIndex === 0
                      ? "var(--secondary)"
                      : "var(--on-surface-dim)",
                }}
              >
                {skill}
              </span>
            ))}
            {extraSkillCount > 0 && (
              <span className="rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] px-2.5 py-1 font-mono text-[0.7rem] text-[var(--primary)]">
                +{extraSkillCount}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--glass-border)] pt-4">
            <div className="min-w-0 space-y-1">
              <span className="flex min-w-0 items-center gap-1 text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                <IconMapPin size={11} stroke={1.5} aria-hidden="true" />
                <span className="truncate">
                  {engineer.location.city}, {engineer.location.country}
                </span>
              </span>
              <span className="flex items-center gap-1 text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                <IconClock size={11} stroke={1.5} aria-hidden="true" />
                {timezoneText(engineer.location.utcOffset)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[0.95rem] tracking-tight text-[var(--on-surface)]">
                {engineer.yearsExp}
                <span className="text-[0.62rem] font-normal text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                  yr
                </span>
              </span>
              <span
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover/card:border-[color-mix(in_srgb,var(--secondary)_38%,transparent)] group-hover/card:text-[var(--secondary)]"
                aria-hidden="true"
              >
                <IconArrowRight size={14} stroke={1.7} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function EngineersPageExperience({
  engineers,
}: {
  engineers: Engineer[];
}) {
  const [activeRole, setActiveRole] = useState<RoleFilter>("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");

  const availableCount = useMemo(
    () =>
      engineers.filter((engineer) => engineer.availability === "now").length,
    [engineers],
  );

  const filteredEngineers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return engineers.filter((engineer) => {
      const matchesAvailability =
        !availableOnly || engineer.availability === "now";
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

      return (
        matchesRole(engineer, activeRole) &&
        matchesAvailability &&
        matchesSearch
      );
    });
  }, [activeRole, availableOnly, engineers, search]);

  const clearFilters = () => {
    setActiveRole("All");
    setAvailableOnly(false);
    setSearch("");
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

          <div className="relative z-[1] mx-auto flex w-full max-w-[96rem] items-start gap-0 px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pt-36">
            <aside className="sticky top-28 hidden max-h-[calc(100svh-8rem)] w-56 shrink-0 flex-col justify-between self-start overflow-y-auto border-r border-[var(--glass-border)] pr-5 xl:flex">
              <div>
                <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                  Filter by role
                </p>
                <div className="space-y-1">
                  {engineerRoles.map((role) => {
                    const isActive = activeRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setActiveRole(role)}
                        aria-pressed={isActive}
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
                        {role === "All" ? "All engineers" : role}
                        <span className="font-mono text-[0.68rem] tracking-tight text-[color-mix(in_srgb,currentColor_66%,transparent)]">
                          {countForRole(engineers, role)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-[var(--glass-border)] pt-5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={availableOnly}
                    onClick={() => setAvailableOnly((value) => !value)}
                    className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                  >
                    <span className="text-[0.84rem] text-[var(--on-surface-dim)]">
                      Available now{" "}
                      <span className="font-mono text-[0.7rem] text-[var(--tertiary)]">
                        ({availableCount})
                      </span>
                    </span>
                    <span
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors duration-200",
                        availableOnly
                          ? "bg-[var(--tertiary)]"
                          : "bg-[color-mix(in_srgb,var(--on-surface-dim)_20%,transparent)]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                          availableOnly ? "translate-x-4" : "translate-x-0.5",
                        )}
                      />
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  ["50+", "engineers in network"],
                  ["8%", "acceptance rate"],
                  ["6+", "avg years experience"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 my-2 backdrop-blur-xl"
                  >
                    <p className="font-mono text-[1.45rem] leading-none tracking-tight text-[var(--on-surface)]">
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
                    <span
                      className="h-px w-7 bg-[var(--secondary)]"
                      aria-hidden="true"
                    />
                    Vetted network / {engineers.length} engineers
                  </p>
                  <h1 className="m-0 text-[clamp(3rem,11vw,6.2rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                    The Network.
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.08 }}
                  className="mt-6 max-w-md md:mt-0 md:text-right"
                >
                  <p className="font-mono text-[clamp(3rem,7vw,5rem)] leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] dark:text-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]">
                    {String(availableCount).padStart(2, "0")}
                  </p>
                  <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                    Senior African engineers cleared for placement across
                    full-stack, AI, Web3, cloud, mobile, and backend systems.
                    Every profile has passed the Andishi technical bar.
                  </p>
                </motion.div>
              </header>

              <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-center">
                <div className="relative w-full max-w-md">
                  <label htmlFor="engineer-search" className="sr-only">
                    Search engineers
                  </label>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--on-surface)_12%,transparent),0_10px_30px_color-mix(in_srgb,var(--secondary)_10%,transparent)]"
                  >
                    <span className="absolute h-4 w-4 rounded-full border border-[color-mix(in_srgb,var(--secondary)_18%,transparent)]" />
                    <IconSearch size={14} stroke={1.8} className="relative" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-1.5 left-11 top-1.5 w-px bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_36%,transparent)] px-2 py-0.5 font-mono text-[0.62rem] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)] sm:inline-flex"
                  >
                    Network index
                  </span>
                  <input
                    id="engineer-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, stack, country..."
                    className="h-11 w-full rounded-full border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] pl-14 pr-10 text-[0.88rem] text-[var(--on-surface)] outline-none shadow-[0_18px_54px_color-mix(in_srgb,var(--bg-deep)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--on-surface)_8%,transparent)] backdrop-blur-2xl transition-all placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)] focus:border-[color-mix(in_srgb,var(--secondary)_42%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_12%,transparent)] sm:pr-32"
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] focus-visible:outline-none sm:right-[7.9rem]"
                        aria-label="Clear search"
                      >
                        <IconX size={13} stroke={2} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-[var(--on-surface-dim)] xl:hidden">
                  <IconFilter size={15} stroke={1.6} aria-hidden="true" />
                  Filter
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
                  {engineerRoles.map((role) => {
                    const isActive = activeRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setActiveRole(role)}
                        aria-pressed={isActive}
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
                        {role === "All" ? "All" : role}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={availableOnly}
                  onClick={() => setAvailableOnly((value) => !value)}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-[0.78rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_35%,transparent)] xl:hidden"
                >
                  <span
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors duration-300",
                      availableOnly
                        ? "bg-[color-mix(in_srgb,var(--tertiary)_72%,var(--surface))]"
                        : "bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-[var(--surface)] shadow transition-transform duration-300",
                        availableOnly ? "translate-x-4" : "translate-x-0.5",
                      )}
                    />
                  </span>
                  Available now
                  <span className="font-mono text-[var(--tertiary)]">
                    ({availableCount})
                  </span>
                </button>

                <span
                  className="ml-auto hidden text-[0.78rem] text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)] lg:block"
                  aria-live="polite"
                >
                  {filteredEngineers.length} engineer
                  {filteredEngineers.length === 1 ? "" : "s"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {filteredEngineers.length > 0 ? (
                  <motion.div
                    key={`${activeRole}-${String(availableOnly)}-${search || "all"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="columns-1 gap-5 sm:columns-2 lg:columns-3"
                  >
                    {filteredEngineers.map((engineer, index) => (
                      <EngineerCard
                        key={engineer.slug}
                        engineer={engineer}
                        index={index}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)]">
                      <IconUsersGroup
                        size={24}
                        stroke={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mb-2 text-[1rem] font-medium text-[var(--on-surface)]">
                      No engineers found
                    </p>
                    <p className="mb-6 text-[0.88rem] text-[var(--on-surface-dim)]">
                      Try a different search term or filter.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface)] transition-all hover:border-[color-mix(in_srgb,var(--secondary)_34%,transparent)] hover:text-[var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    Do not see exactly what you need?
                  </p>
                  <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                    Submit a brief. We will find the right engineer.
                  </h2>
                  <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                    Tell us your stack, role, and timeline. We surface matched
                    senior African engineers, including profiles not listed
                    here.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/start-project"
                      className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Start matching
                      <IconArrowRight size={15} stroke={2} />
                    </Link>
                    <Link
                      href="/hire"
                      className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      How matching works
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </CustomCursorRegion>
      </main>
    </>
  );
}
