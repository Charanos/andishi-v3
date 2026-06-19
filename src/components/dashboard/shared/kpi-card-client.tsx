"use client";

import { useState } from "react";
import {
  IconActivity,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconListDetails,
  IconCheck,
} from "@tabler/icons-react";
import { DashboardBarChart, DashboardLineChart } from "./dashboard-chart";

export function KpiCardClientBody({
  chart = "line",
  data,
  label,
  trend,
  value,
  metricType,
  breakdownData,
  slaTarget,
  iconElement,
}: {
  chart?: "bar" | "line";
  data?: number[];
  label: string;
  trend: string;
  value: string;
  metricType?: "satisfaction" | "capacity" | "pipeline" | "sla" | "standard";
  breakdownData?: { label: string; value: number; percent: number; color: string }[];
  slaTarget?: number;
  iconElement?: React.ReactNode;
}) {
  const [showUtility, setShowUtility] = useState(true);
  const isPositive = trend.startsWith("+");
  const isNegative = trend.startsWith("-");

  // Determine Polymorphic Visualizer Type
  const normalizedLabel = label.toLowerCase();
  let type = metricType;
  if (!type) {
    if (
      normalizedLabel.includes("satisfaction") ||
      normalizedLabel.includes("rating") ||
      normalizedLabel.includes("quality") ||
      value.includes("/ 5") ||
      value.includes("/ 10")
    ) {
      type = "satisfaction";
    } else if (
      normalizedLabel.includes("engineer") ||
      normalizedLabel.includes("bench") ||
      normalizedLabel.includes("talent") ||
      normalizedLabel.includes("supply") ||
      normalizedLabel.includes("user") ||
      normalizedLabel.includes("session")
    ) {
      type = "capacity";
    } else if (
      normalizedLabel.includes("pipeline") ||
      normalizedLabel.includes("match") ||
      normalizedLabel.includes("placement") ||
      normalizedLabel.includes("brief") ||
      normalizedLabel.includes("case") ||
      normalizedLabel.includes("alert") ||
      normalizedLabel.includes("slate") ||
      normalizedLabel.includes("shortlist")
    ) {
      type = "pipeline";
    } else if (
      normalizedLabel.includes("time") ||
      normalizedLabel.includes("sla") ||
      normalizedLabel.includes("response") ||
      normalizedLabel.includes("posture") ||
      normalizedLabel.includes("score") ||
      normalizedLabel.includes("readiness") ||
      normalizedLabel.includes("pressure") ||
      normalizedLabel.includes("health")
    ) {
      type = "sla";
    } else {
      type = "standard";
    }
  }

  const renderTrendIcon = () => {
    if (isPositive) return <IconArrowUpRight size={13} stroke={2} className="shrink-0" />;
    if (isNegative) return <IconArrowDownRight size={13} stroke={2} className="shrink-0" />;
    return <IconMinus size={13} stroke={2} className="shrink-0 opacity-60" />;
  };

  const renderUtilityView = () => {
    switch (type) {
      case "satisfaction": {
        const score = parseFloat(value.split("/")[0]) || 4.8;
        const maxScore = parseFloat(value.split("/")[1]) || 5;
        const percent = (score / maxScore) * 100;
        const radius = 19;
        const strokeWidth = 3.5;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percent / 100) * circumference;

        return (
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex-1 grid gap-1.5 text-[0.73rem] text-[var(--on-surface-dim)]">
              {[
                { star: "5★", pct: "88%", w: "88%", color: "var(--tertiary)" },
                { star: "4★", pct: "10%", w: "10%", color: "var(--secondary)" },
                { star: "3★", pct: "2%", w: "2%", color: "color-mix(in srgb, var(--on-surface-dim) 40%, transparent)" },
              ].map(({ star, pct, w, color }) => (
                <div key={star} className="flex items-center gap-1.5">
                  <span className="w-5 font-mono text-right text-[var(--on-surface)]">{star}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: w, backgroundColor: color }} />
                  </div>
                  <span className="w-7 font-mono text-left opacity-80">{pct}</span>
                </div>
              ))}
            </div>
            <div className="relative shrink-0 w-[3.5rem] h-[3.5rem] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r={radius} fill="none" stroke="color-mix(in srgb, var(--on-surface) 8%, transparent)" strokeWidth={strokeWidth} />
                <circle
                  cx="23" cy="23" r={radius}
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--secondary) 50%, transparent))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[0.86rem] font-normal text-[var(--on-surface)]">{score}</span>
              </div>
            </div>
          </div>
        );
      }

      case "capacity": {
        const items = breakdownData || [
          { label: "AI/ML", value: 62, percent: 42, color: "var(--primary)" },
          { label: "Fullstack", value: 54, percent: 36, color: "var(--secondary)" },
          { label: "Cloud/AWS", value: 22, percent: 15, color: "var(--tertiary)" },
          { label: "Web3", value: 10, percent: 7, color: "orange" },
        ];

        return (
          <div className="mt-4">
            {/* Segmented bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 cursor-pointer hover:brightness-125"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  title={`${item.label}: ${item.value} (${item.percent}%)`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {items.slice(0, 4).map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-[0.65rem] text-[var(--on-surface-dim)] font-mono">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.label}:</span>
                  <span className="text-[var(--on-surface)] font-medium">{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      case "pipeline": {
        let steps = [
          { name: "New", count: 3, color: "var(--secondary)" },
          { name: "Match", count: 4, color: "var(--tertiary)" },
          { name: "Review", count: 3, color: "var(--primary)" },
          { name: "Placed", count: 2, color: "var(--on-surface)" },
        ];

        if (normalizedLabel.includes("match")) {
          steps = [
            { name: "Proposed", count: 2, color: "var(--primary)" },
            { name: "Reviewing", count: 4, color: "var(--secondary)" },
            { name: "Intros", count: 2, color: "var(--tertiary)" },
            { name: "Accepted", count: 0, color: "var(--on-surface)" },
          ];
        } else if (normalizedLabel.includes("placement")) {
          steps = [
            { name: "Starting", count: 1, color: "var(--secondary)" },
            { name: "Embedded", count: 3, color: "var(--tertiary)" },
            { name: "Active", count: 1, color: "var(--primary)" },
          ];
        } else if (normalizedLabel.includes("slate") || normalizedLabel.includes("shortlist")) {
          steps = [
            { name: "Draft", count: 1, color: "var(--on-surface-dim)" },
            { name: "Sent", count: 1, color: "var(--secondary)" },
            { name: "Viewing", count: 1, color: "var(--primary)" },
            { name: "Decided", count: 0, color: "var(--tertiary)" },
          ];
        } else if (normalizedLabel.includes("brief")) {
          steps = [
            { name: "New", count: 2, color: "var(--secondary)" },
            { name: "Review", count: 3, color: "var(--tertiary)" },
            { name: "Match", count: 2, color: "var(--primary)" },
            { name: "Listed", count: 1, color: "var(--on-surface)" },
          ];
        }

        const total = steps.reduce((s, step) => s + step.count, 0);

        return (
          <div className="mt-4 w-full">
            <div className="relative flex items-end justify-between w-full gap-1">
              {steps.map((step, idx) => {
                const isActive = step.count > 0;
                const barHeight = total > 0 ? Math.max(12, (step.count / Math.max(...steps.map(s => s.count), 1)) * 36) : 12;
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[0.68rem] font-normal" style={{ color: isActive ? step.color : "var(--on-surface-dim)", opacity: isActive ? 1 : 0.5 }}>
                      {step.count}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all duration-700 ease-out"
                      style={{
                        height: `${barHeight}px`,
                        background: isActive
                          ? `linear-gradient(180deg, ${step.color}, color-mix(in srgb, ${step.color} 40%, transparent))`
                          : "color-mix(in srgb, var(--on-surface) 8%, transparent)",
                        boxShadow: isActive ? `0 0 12px color-mix(in srgb, ${step.color} 25%, transparent)` : "none",
                      }}
                    />
                    <span className="text-[0.55rem] uppercase tracking-wider font-normal truncate w-full text-center" style={{ color: isActive ? "var(--on-surface)" : "var(--on-surface-dim)", opacity: isActive ? 0.9 : 0.5 }}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case "sla": {
        const valNum = parseFloat(value) || 3.6;
        const target = slaTarget || (normalizedLabel.includes("time") ? 4.0 : normalizedLabel.includes("pressure") ? 80 : 30);
        const maxScale = Math.max(target * 1.5, valNum * 1.15);
        const targetPercent = (target / maxScale) * 100;
        const currentPercent = Math.min((valNum / maxScale) * 100, 100);
        const isCompliant = normalizedLabel.includes("pressure")
          ? valNum <= target
          : normalizedLabel.includes("health")
          ? valNum >= 70
          : valNum <= target;

        return (
          <div className="mt-4">
            <div className="flex items-end justify-between text-[0.68rem] text-[var(--on-surface-dim)] mb-2 font-mono">
              <span
                className="flex items-center gap-1.5 font-normal tracking-tight"
                style={{ color: isCompliant ? "var(--tertiary)" : "var(--error)" }}
              >
                <span
                  className={`grid h-[1rem] w-[1rem] place-items-center rounded-full ${isCompliant ? "bg-[color-mix(in_srgb,var(--tertiary)_20%,transparent)]" : "bg-[color-mix(in_srgb,var(--error)_20%,transparent)]"}`}
                >
                  {isCompliant ? (
                    <IconCheck size={9} stroke={3} />
                  ) : (
                    <span className="w-[4px] h-[4px] rounded-full bg-current" />
                  )}
                </span>
                {isCompliant ? "ON TRACK" : "ACTION REQ"}
              </span>
              <span className="opacity-70">
                TARGET: {normalizedLabel.includes("health") ? "≥70" : `<${target}`}
                {normalizedLabel.includes("time") ? "d" : normalizedLabel.includes("pressure") ? "%" : "m"}
              </span>
            </div>
            {/* Track */}
            <div className="relative w-full h-[0.38rem] rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${currentPercent}%`,
                  background: isCompliant
                    ? "linear-gradient(90deg, color-mix(in srgb, var(--tertiary) 40%, transparent), var(--tertiary))"
                    : "linear-gradient(90deg, color-mix(in srgb, var(--error) 40%, transparent), var(--error))",
                }}
              />
              {/* Target marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[var(--on-surface)] shadow-[0_0_6px_var(--on-surface)] z-10 rounded-full"
                style={{ left: `${targetPercent}%`, transform: "translateX(-1px)" }}
                title="Target Limit"
              />
            </div>
            {/* Scale labels */}
            <div className="mt-1.5 flex items-center justify-between text-[0.6rem] font-mono opacity-40">
              <span>0</span>
              <span>{Math.round(maxScale)}{normalizedLabel.includes("time") ? "d" : normalizedLabel.includes("pressure") ? "%" : "m"}</span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full p-5 lg:p-6 pb-5 w-full">
      {/* Top row: label + toggle */}
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-words text-[0.86rem] leading-snug font-medium text-[var(--on-surface-dim)]">
          {label}
        </p>

        <div className="flex items-center gap-1.5 shrink-0 bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] border border-[var(--glass-border)] rounded-xl p-1 shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-md">
          {type !== "standard" && (
            <button
              type="button"
              onClick={() => setShowUtility(!showUtility)}
              className={`grid h-7 w-7 place-items-center rounded-[0.5rem] transition-all duration-300 ${
                showUtility
                  ? "bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] text-[var(--secondary)]"
                  : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]"
              }`}
              title={showUtility ? "Show historical trend" : "Show utility view"}
            >
              {showUtility ? (
                <IconListDetails size={14} stroke={1.8} />
              ) : (
                <IconActivity size={14} stroke={1.8} />
              )}
            </button>
          )}
          <span className="grid h-7 w-7 place-items-center rounded-[0.5rem] bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] text-[var(--secondary)]">
            {iconElement}
          </span>
        </div>
      </div>

      {/* Value + trend */}
      <div className="mt-4">
        <p className="break-words font-mono text-[clamp(1.6rem,2.6vw,2rem)] leading-none tracking-tight text-[var(--on-surface)] font-normal">
          {value}
        </p>
        <p
          className={`mt-2 flex items-center gap-1 text-[0.78rem] leading-snug font-medium ${
            isPositive
              ? "text-[var(--tertiary)]"
              : isNegative
              ? "text-[color-mix(in_srgb,var(--error)_80%,var(--on-surface-dim))]"
              : "text-[var(--on-surface-dim)]"
          }`}
        >
          {renderTrendIcon()}
          <span className="min-w-0 break-words">{trend}</span>
        </p>
      </div>

      {/* Flexible bottom: utility or sparkline chart */}
      <div className="mt-auto pt-4 w-full flex flex-col justify-end min-h-[4.5rem]">
        {showUtility && type !== "standard" ? renderUtilityView() : null}

        {(!showUtility || type === "standard") && data ? (
          <div className="w-full mt-2 -mx-1">
            {chart === "bar" ? (
              <DashboardBarChart data={data} height={48} />
            ) : (
              <DashboardLineChart data={data} height={48} variant="sparkline" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
