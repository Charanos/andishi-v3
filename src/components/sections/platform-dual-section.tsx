"use client";

import {
  IconBolt,
  IconBuilding,
  IconCheck,
  IconClock,
  IconCode,
  IconCoin,
  IconFileText,
  IconGitPullRequest,
  IconLayoutDashboard,
  IconMessage2,
  IconPlayerPause,
  IconRocket,
  IconSettings,
  IconShieldCheck,
  IconStar,
  IconTrendingUp,
  IconUsers,
  IconWorld,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";

type ViewMode = "client" | "developer";
type Accent = "primary" | "secondary" | "tertiary" | "amber";

type Annotation = {
  icon: TablerIcon;
  accent: Accent;
  title: string;
  body: string;
  badge?: string;
};

const accentStyles: Record<Accent, string> = {
  primary:
    "border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
  secondary:
    "border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]",
  tertiary:
    "border-[color-mix(in_srgb,var(--tertiary)_22%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]",
  amber:
    "border-[color-mix(in_srgb,#f59e0b_24%,transparent)] bg-[color-mix(in_srgb,#f59e0b_10%,transparent)] text-[#d97706] dark:text-[#fbbf24]",
};

const clientAnnotations: Annotation[] = [
  {
    icon: IconBolt,
    accent: "secondary",
    title: "First match in 48 hours",
    body: "Matched senior profiles land before your next sprint planning session.",
    badge: "3.8d avg",
  },
  {
    icon: IconLayoutDashboard,
    accent: "primary",
    title: "Live placement visibility",
    body: "Track profiles, interviews, onboarding, PR activity, and delivery signals in one workspace.",
  },
  {
    icon: IconMessage2,
    accent: "tertiary",
    title: "Direct team communication",
    body: "Keep clients, Andishi, and matched engineers aligned without endless status chasing.",
  },
  {
    icon: IconShieldCheck,
    accent: "amber",
    title: "Contract-backed engagements",
    body: "Every match is protected by clear terms, confidentiality, and a practical guarantee window.",
  },
];

const developerAnnotations: Annotation[] = [
  {
    icon: IconCoin,
    accent: "tertiary",
    title: "Transparent earnings",
    body: "Engineers see project value, payment cadence, and active commitments clearly.",
    badge: "$6.8K May",
  },
  {
    icon: IconClock,
    accent: "secondary",
    title: "Built-in delivery rhythm",
    body: "Time logs, milestones, and review windows stay tied to the client brief.",
  },
  {
    icon: IconWorld,
    accent: "primary",
    title: "Global client access",
    body: "Africa-based engineers can work with funded teams across the US, EU, MENA, and local markets.",
  },
  {
    icon: IconStar,
    accent: "amber",
    title: "Reputation that compounds",
    body: "A verified record of delivered work helps senior engineers unlock better engagements.",
  },
];

const springTransition = { type: "spring", damping: 26, stiffness: 210 } as const;

function AnnotationCard({
  annotation,
  index,
}: {
  annotation: Annotation;
  index: number;
}) {
  const Icon = annotation.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ ...springTransition, delay: index * 0.045 }}
      className="group relative overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-high)_34%,transparent)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-20 w-28 rotate-12 rounded-[1.4rem] border border-[color-mix(in_srgb,var(--secondary)_12%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70"
      />
      <div className="relative">
        <div
          className={`mb-3 grid h-9 w-9 place-items-center rounded-[0.8rem] border ${accentStyles[annotation.accent]}`}
          aria-hidden="true"
        >
          <Icon size={17} stroke={1.6} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[0.98rem] font-medium leading-tight text-[var(--on-surface)]">
            {annotation.title}
          </h3>
          {annotation.badge ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_9%,transparent)] px-2 py-1 font-mono text-[0.66rem] text-[var(--tertiary)]">
              <IconTrendingUp size={11} stroke={1.7} />
              {annotation.badge}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
          {annotation.body}
        </p>
      </div>
    </motion.article>
  );
}

function BrowserChrome({ view }: { view: ViewMode }) {
  return (
    <div className="flex h-11 items-center gap-2 border-b border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_52%,transparent)] px-4">
      <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
      <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
      <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={springTransition}
          className="ml-2 flex-1 rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_20%,transparent)] px-3 py-1 text-center font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]"
        >
          {view === "client"
            ? "workspace.andishi.dev/client"
            : "workspace.andishi.dev/developer"}
        </motion.div>
      </AnimatePresence>
      <div className="hidden items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_7%,transparent)] px-3 py-1 sm:flex">
        <motion.span
          animate={{ opacity: [1, 0.42, 1], scale: [1, 0.78, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)]"
          aria-hidden="true"
        />
        <span className="text-[0.7rem] text-[var(--on-surface-dim)]">
          {view === "client" ? "Client" : "Developer"}
        </span>
      </div>
    </div>
  );
}

function AppRail({
  icons,
}: {
  icons: Array<{ icon: TablerIcon; active?: boolean }>;
}) {
  return (
    <div
      className="hidden w-[3.4rem] shrink-0 flex-col items-center gap-3 border-r border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] pt-4 sm:flex"
      aria-hidden="true"
    >
      {icons.map(({ icon: Icon, active }, index) => (
        <span
          key={index}
          className={`grid h-9 w-9 place-items-center rounded-[0.75rem] transition-colors ${
            active
              ? "border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
              : "text-[color-mix(in_srgb,var(--on-surface-dim)_46%,transparent)]"
          }`}
        >
          <Icon size={16} stroke={active ? 2 : 1.5} />
        </span>
      ))}
    </div>
  );
}

function MetricCell({
  label,
  value,
  detail,
  accent = "var(--secondary)",
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[0.9rem] border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] p-3">
      <p className="label-caps text-[0.62rem] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-[1.25rem] leading-none tracking-tight text-[var(--on-surface)]">
        {value}
      </p>
      <p className="mt-1 text-[0.72rem]" style={{ color: accent }}>
        {detail}
      </p>
    </div>
  );
}

function ClientPanel() {
  const projects = [
    {
      name: "Fintech dashboard",
      status: "Active",
      progress: 72,
      devs: ["AK", "NM", "OB"],
      due: "12d left",
      accent: "var(--secondary)",
    },
    {
      name: "Commerce API rails",
      status: "Review",
      progress: 91,
      devs: ["SM", "JO"],
      due: "2d left",
      accent: "var(--tertiary)",
    },
  ];

  return (
    <div className="flex h-full">
      <AppRail
        icons={[
          { icon: IconLayoutDashboard, active: true },
          { icon: IconUsers },
          { icon: IconMessage2 },
          { icon: IconFileText },
          { icon: IconSettings },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[1rem] font-medium leading-tight text-[var(--on-surface)]">
              Project overview
            </p>
            <p className="text-[0.78rem] text-[var(--on-surface-dim)]">
              Match, delivery, and review status.
            </p>
          </div>
          <span className="rounded-full border border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] px-3 py-1 font-mono text-[0.7rem] text-[var(--secondary)]">
            3 active
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <MetricCell label="Match time" value="3.8d" detail="12% faster" />
          <MetricCell
            label="Devs active"
            value="4"
            detail="+1 this week"
            accent="var(--tertiary)"
          />
          <MetricCell
            label="Milestones"
            value="12/14"
            detail="2 pending"
            accent="#d97706"
          />
        </div>

        <div className="grid gap-3">
          {projects.map((project, projectIndex) => (
            <div
              key={project.name}
              className="rounded-[0.95rem] border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="truncate text-[0.9rem] font-medium text-[var(--on-surface)]">
                  {project.name}
                </p>
                <span
                  className="rounded-full px-2.5 py-1 font-mono text-[0.64rem]"
                  style={{
                    color: project.accent,
                    backgroundColor: `color-mix(in srgb, ${project.accent} 10%, transparent)`,
                  }}
                >
                  {project.status}
                </span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_9%,transparent)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${project.progress}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.18 }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--secondary),var(--tertiary))]"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex">
                  {project.devs.map((developer, developerIndex) => (
                    <span
                      key={developer}
                      className="grid h-6 w-6 place-items-center rounded-full border border-[var(--surface)] text-[0.65rem] font-medium text-[var(--on-surface)]"
                      style={{
                        marginLeft: developerIndex > 0 ? "-0.3rem" : 0,
                        backgroundColor:
                          projectIndex === 0
                            ? `color-mix(in srgb, var(--secondary) ${18 + developerIndex * 7}%, var(--surface))`
                            : `color-mix(in srgb, var(--tertiary) ${18 + developerIndex * 7}%, var(--surface))`,
                      }}
                    >
                      {developer}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
                  {project.due}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto grid gap-2">
          {[
            ["AK", "Auth module deployed to staging", "2m ago", true],
            ["NM", "PR #47 ready for client review", "14m ago", false],
          ].map(([initials, text, time, unread]) => (
            <div
              key={String(text)}
              className="flex items-start gap-3 rounded-[0.9rem] border border-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] font-mono text-[0.68rem] text-[var(--secondary)]">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.78rem] text-[var(--on-surface)]">
                  {text}
                </p>
                <p className="font-mono text-[0.66rem] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                  {time}
                </p>
              </div>
              {unread ? (
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeveloperPanel() {
  const bars = [42, 66, 58, 82, 48, 72, 25];
  const tasks = [
    ["Integrate webhook endpoints", true, "done"],
    ["Write unit tests for auth module", true, "done"],
    ["Deploy staging environment", false, "today"],
    ["Review PR #52 from client feedback", false, "tmrw"],
  ] as const;

  return (
    <div className="flex h-full">
      <AppRail
        icons={[
          { icon: IconLayoutDashboard, active: true },
          { icon: IconClock },
          { icon: IconCoin },
          { icon: IconGitPullRequest },
          { icon: IconSettings },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[1rem] font-medium leading-tight text-[var(--on-surface)]">
              Developer workspace
            </p>
            <p className="text-[0.78rem] text-[var(--on-surface-dim)]">
              Earnings, time, reviews, and delivery tasks.
            </p>
          </div>
          <span className="rounded-full border border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_8%,transparent)] px-3 py-1 font-mono text-[0.7rem] text-[var(--tertiary)]">
            Available
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[1rem] border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--secondary)_13%,transparent),color-mix(in_srgb,var(--primary)_9%,transparent))] p-4">
          <div
            aria-hidden="true"
            className="absolute -right-6 -top-10 h-28 w-40 rotate-12 rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)]"
          />
          <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
            Total earned / May
          </p>
          <p className="mt-2 font-mono text-[1.9rem] leading-none tracking-tight text-[var(--on-surface)]">
            $6,840
          </p>
          <p className="mt-2 text-[0.82rem] text-[var(--tertiary)]">
            $1,200 above last month
          </p>
        </div>

        <div className="rounded-[1rem] border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
              Time tracker
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
              <IconPlayerPause size={15} stroke={1.7} />
            </span>
          </div>
          <p className="font-mono text-[1.7rem] tracking-tight text-[var(--secondary)]">
            03:42:18
          </p>
          <p className="mb-3 text-[0.78rem] text-[var(--on-surface-dim)]">
            Fintech dashboard / API layer
          </p>
          <div
            className="flex h-9 items-end gap-1.5"
            role="img"
            aria-label="Weekly delivery hours chart"
          >
            {bars.map((height, index) => (
              <motion.span
                key={index}
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.045 }}
                className={`flex-1 rounded-t-[0.28rem] ${
                  index === 5
                    ? "bg-[var(--secondary)]"
                    : "bg-[color-mix(in_srgb,var(--secondary)_18%,transparent)]"
                } ${index === 6 ? "opacity-40" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {tasks.map(([task, done, tag]) => (
            <div
              key={task}
              className="flex items-center gap-3 rounded-[0.9rem] border border-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2.5"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                  done
                    ? "border-[var(--tertiary)] bg-[var(--tertiary)] text-[var(--on-tertiary)]"
                    : "border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)]"
                }`}
              >
                {done ? <IconCheck size={12} stroke={2.4} /> : null}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-[0.82rem] ${
                  done
                    ? "text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)] line-through"
                    : "text-[var(--on-surface-dim)]"
                }`}
              >
                {task}
              </span>
              <span
                className={`rounded-md px-2 py-1 font-mono text-[0.64rem] ${
                  done
                    ? "bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
                    : "bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]"
                }`}
              >
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformFrame({ view }: { view: ViewMode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--on-surface)_13%,transparent)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] shadow-[0_32px_100px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] backdrop-blur-2xl">
      <BrowserChrome view={view} />
      <div className="relative h-[34rem] overflow-hidden sm:h-[31rem]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "client" ? (
            <motion.div
              key="client"
              className="absolute inset-0"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -36, scale: 0.985 }
              }
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -36, scale: 0.985 }
              }
              transition={springTransition}
            >
              <ClientPanel />
            </motion.div>
          ) : (
            <motion.div
              key="developer"
              className="absolute inset-0"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 36, scale: 0.985 }
              }
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 36, scale: 0.985 }
              }
              transition={springTransition}
            >
              <DeveloperPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PlatformDualSection() {
  const [view, setView] = useState<ViewMode>("client");
  const annotations =
    view === "client" ? clientAnnotations : developerAnnotations;

  return (
    <section
      className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--bg-deep)_58%,var(--bg))] px-5 py-24 sm:px-8 lg:py-32"
      aria-labelledby="platform-heading"
    >
      <CustomCursorRegion className="-mx-5 -my-24 px-5 py-24 sm:-mx-8 sm:px-8 lg:-my-32 lg:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_12%,transparent),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[6%] top-16 z-0 h-40 w-64 rotate-[-9deg] rounded-[2.4rem] border border-[color-mix(in_srgb,var(--secondary)_12%,transparent)] opacity-55"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-20 right-[8%] z-0 h-52 w-80 rotate-[8deg] rounded-[2.6rem] border border-[color-mix(in_srgb,var(--primary)_12%,transparent)] opacity-50"
        />

        <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
              <span className="h-px w-7 bg-[var(--secondary)]" />
              The platform
            </p>
            <h2
              id="platform-heading"
              className="max-w-[13ch] text-[clamp(2.45rem,7vw,5.2rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]"
            >
              Full visibility. Both sides of the match.
            </h2>
          </div>
          <div className="max-w-xl lg:text-right">
            <p className="body-md text-[var(--on-surface-dim)]">
              One workspace gives clients a clean view of matched engineers,
              while developers get the delivery context, payment clarity, and
              reputation trail they need to do senior work well.
            </p>
            <div
              className="mt-6 inline-flex rounded-full border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] p-1 backdrop-blur-xl"
              role="group"
              aria-label="Switch dashboard view"
            >
              {(["client", "developer"] as const).map((mode) => {
                const Icon = mode === "client" ? IconBuilding : IconCode;
                const active = mode === view;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    aria-pressed={active}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.86rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)] sm:px-5 ${
                      active
                        ? "bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_12px_34px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]"
                        : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    <Icon size={15} stroke={1.7} />
                    {mode === "client" ? "Client view" : "Developer view"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] xl:items-start">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AnimatePresence mode="wait">
              <motion.div key={view} className="contents">
                {annotations.map((annotation, index) => (
                  <AnnotationCard
                    key={annotation.title}
                    annotation={annotation}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <PlatformFrame view={view} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/hire" variant="primary">
            Start matching
            <IconRocket size={16} stroke={1.8} />
          </LinkButton>
          <LinkButton
            href="mailto:hire@andishi.dev?subject=Developer talent application"
            variant="glass"
          >
            Apply as developer
            <IconCode size={16} stroke={1.7} />
          </LinkButton>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            "No lock-in contracts",
            "Senior engineers only",
            "48-hour first match",
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 text-[0.78rem] font-medium text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]"
            >
              <IconCheck
                size={14}
                stroke={2}
                className="text-[var(--tertiary)]"
              />
              {item}
            </span>
          ))}
        </div>
      </div>
      </CustomCursorRegion>
    </section>
  );
}
