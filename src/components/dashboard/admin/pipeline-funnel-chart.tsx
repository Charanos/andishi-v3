"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowNarrowDown, IconChevronRight } from "@tabler/icons-react";
import type { PipelineColumn } from "@/components/dashboard/admin/pipeline-board";

const stageConfig: Array<{
  color: string;
  href: string;
}> = [
  {
    color: "color-mix(in srgb, var(--on-surface-dim) 38%, transparent)",
    href: "/admin/briefs",
  },
  {
    color: "color-mix(in srgb, var(--primary) 48%, transparent)",
    href: "/admin/matches?stage=shortlisting",
  },
  {
    color: "color-mix(in srgb, var(--secondary) 55%, transparent)",
    href: "/admin/matches?stage=profiles-sent",
  },
  {
    color: "color-mix(in srgb, var(--tertiary) 58%, transparent)",
    href: "/admin/matches?stage=intro-scheduled",
  },
  {
    color: "var(--tertiary)",
    href: "/admin/placements",
  },
];

const stageAverageDays = [0.8, 1.2, 0.9, 2.1];

export function PipelineFunnelChart({ columns }: { columns: PipelineColumn[] }) {
  const maxCount = Math.max(...columns.map((column) => column.count), 1);
  const firstCount = columns[0]?.count ?? 1;
  const lastCount = columns.at(-1)?.count ?? 0;
  const overallConversion = Math.round((lastCount / firstCount) * 100);
  const totalAverageDays = stageAverageDays.reduce((sum, days) => sum + days, 0);

  return (
    <div className="flex flex-col gap-2.5">
      {columns.map((column, index) => {
        const barWidth = (column.count / maxCount) * 100;
        const previousCount = index > 0 ? columns[index - 1]?.count ?? column.count : null;
        const conversion =
          previousCount !== null && previousCount > 0
            ? Math.round((column.count / previousCount) * 100)
            : null;
        const isBottleneck = conversion !== null && conversion < 60;
        const config = stageConfig[index] ?? stageConfig[0];

        return (
          <div key={column.title}>
            <Link
              href={config.href}
              className="group grid grid-cols-[minmax(8.25rem,11rem)_minmax(0,1fr)_2.75rem] items-center gap-3 rounded-lg px-1.5 py-2.5 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--on-surface)_4%,transparent)] sm:gap-4"
            >
              <span className="truncate text-left text-[0.86rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-200 group-hover:text-[var(--on-surface)]">
                {column.title}
              </span>
              <span className="relative h-6 overflow-hidden rounded-[0.3rem] bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)]">
                <motion.span
                  animate={{ width: `${barWidth}%` }}
                  className="absolute inset-y-0 left-0 rounded-[0.25rem]"
                  initial={{ width: 0 }}
                  style={{ background: config.color }}
                  transition={{
                    delay: index * 0.07,
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
                {barWidth > 30 && (
                  <motion.span
                    animate={{ opacity: 0.62 }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[0.82rem] text-[var(--on-surface)]"
                    initial={{ opacity: 0 }}
                    transition={{ delay: index * 0.07 + 0.48, duration: 0.3 }}
                  >
                    {column.count}
                  </motion.span>
                )}
              </span>
              <span className="flex items-center justify-end gap-1.5">
                <span className="font-mono text-[0.94rem] font-medium text-[var(--on-surface)]">
                  {column.count}
                </span>
                <IconChevronRight
                  className="text-[var(--on-surface-dim)] opacity-0 transition-opacity duration-200 group-hover:opacity-50"
                  size={12}
                  stroke={1.5}
                />
              </span>
            </Link>

            {conversion !== null && (
              <div className="grid grid-cols-[minmax(8.25rem,11rem)_minmax(0,1fr)_2.75rem] items-center gap-3 py-0.5 sm:gap-4">
                <span />
                <span className="flex min-w-0 flex-wrap items-center gap-1 pl-1.5">
                  <IconArrowNarrowDown
                    className={
                      isBottleneck
                        ? "text-[var(--error)]"
                        : "text-[var(--on-surface-dim)] opacity-35"
                    }
                    size={11}
                    stroke={1.5}
                  />
                  <span
                    className={
                      isBottleneck
                        ? "font-mono text-[0.8rem] text-[var(--error)]"
                        : "font-mono text-[0.8rem] text-[var(--on-surface-dim)] opacity-60"
                    }
                  >
                    {conversion}%
                  </span>
                  {stageAverageDays[index - 1] !== undefined && (
                    <span className="font-mono text-[0.78rem] text-[var(--on-surface-dim)] opacity-55">
                      {stageAverageDays[index - 1]}d avg
                    </span>
                  )}
                  {isBottleneck && (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-2 py-0.5 font-mono text-[0.74rem] font-medium text-[var(--error)]">
                      slow
                    </span>
                  )}
                </span>
                <span />
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 border-t border-[var(--glass-border)] pt-4">
        <FunnelStat label="Brief-to-placement" value={`${overallConversion}%`} />
        <Separator />
        <FunnelStat label="Avg to placement" value={`${totalAverageDays.toFixed(1)}d`} />
        <Separator className="hidden sm:block" />
        <FunnelStat label="Placed this week" value={String(lastCount)} tone="success" />
      </div>
    </div>
  );
}

function FunnelStat({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "success";
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.82rem] text-[var(--on-surface-dim)]">{label}</span>
      <span
        className={
          tone === "success"
            ? "font-mono text-[0.94rem] font-medium text-[var(--tertiary)]"
            : "font-mono text-[0.94rem] font-medium text-[var(--on-surface)]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={className ? `${className} h-3 w-px bg-[var(--glass-border)]` : "h-3 w-px bg-[var(--glass-border)]"} />;
}
