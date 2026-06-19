"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  index: number;
  value: number;
  label?: string;
};

const tooltipStyle = {
  background: "color-mix(in srgb, var(--surface-high) 80%, transparent)",
  backdropFilter: "blur(24px)",
  border: "1px solid color-mix(in srgb, var(--glass-border) 60%, transparent)",
  borderRadius: "14px",
  boxShadow: "0 14px 48px color-mix(in srgb, var(--bg-deep) 35%, transparent), inset 0 1px 0 color-mix(in srgb, white 8%, transparent)",
  color: "var(--on-surface)",
  fontSize: "12px",
  padding: "10px 14px",
  fontWeight: 500,
};

/**
 * DashboardLineChart
 * variant="sparkline" - no axes, no grid. Perfect for small KPI cards.
 * variant="area"      - subtle Y-axis labels + horizontal reference lines for hero panel.
 */
export function DashboardLineChart({
  data,
  height = 52,
  variant = "sparkline",
  labels,
}: {
  data: number[];
  height?: number;
  variant?: "sparkline" | "area";
  labels?: string[];
}) {
  const uniqueId = useId().replace(/:/g, "");
  const points: ChartPoint[] = data.map((value, index) => ({
    index,
    value,
    label: labels?.[index] ?? String(index + 1),
  }));

  const min = Math.min(...data);
  const max = Math.max(...data);
  const mid = Math.round((min + max) / 2);
  const showContext = variant === "area" && height >= 140;

  if (variant === "sparkline") {
    const startVal = data[0];
    const endVal = data[data.length - 1];
    const avgVal = parseFloat((data.reduce((sum, v) => sum + v, 0) / data.length).toFixed(1));

    return (
      <div className="w-full flex flex-col items-center justify-center">
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ bottom: 0, left: 0, right: 0, top: 4 }}
            >
              <defs>
                <linearGradient id={`sparkGrad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
                </linearGradient>
                <filter
                  id={`sparkGlow-${uniqueId}`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <Tooltip
                cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: "var(--secondary)", fontWeight: 600, fontSize: "14px" }}
                labelFormatter={(label, items) => {
                  const p = items[0]?.payload as ChartPoint | undefined;
                  return p?.label ? `Point: ${p.label}` : `Index ${label + 1}`;
                }}
                formatter={(value) => [`Value: ${value}`, ""]}
              />
              <ReferenceLine
                y={avgVal}
                stroke="color-mix(in srgb, var(--on-surface-dim) 40%, transparent)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Area
                dataKey="value"
                fill={`url(#sparkGrad-${uniqueId})`}
                stroke="var(--secondary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4.5, fill: "var(--surface)", stroke: "var(--secondary)", strokeWidth: 2 }}
                isAnimationActive
                animationDuration={800}
                type="monotone"
                style={{ filter: `url(#sparkGlow-${uniqueId})` }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full items-center justify-between mt-3 text-[0.68rem] font-mono text-[var(--on-surface-dim)] opacity-90 px-1">
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">START: {startVal}</span>
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">AVG: {avgVal}</span>
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">END: {endVal}</span>
        </div>
      </div>
    );
  }

  // variant === "area" - hero panel chart with context
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ bottom: showContext ? 18 : 0, left: 0, right: 12, top: 12 }}
        >
          <defs>
            <linearGradient id="areaGradientHero" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--secondary)"
                stopOpacity={0.4}
              />
              <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
            </linearGradient>
            <filter id="areaGlow" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {showContext && (
            <CartesianGrid
              stroke="color-mix(in srgb, var(--glass-border) 40%, transparent)"
              strokeDasharray="4 6"
              vertical={false}
            />
          )}
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 11,
              fill: "color-mix(in srgb, var(--on-surface-dim) 80%, transparent)",
              fontFamily: "monospace",
            }}
            width={40}
            ticks={[min, mid, max]}
            domain={["dataMin", "dataMax"]}
          />
          {showContext && (
            <XAxis
              axisLine={false}
              dataKey="label"
              interval="preserveStartEnd"
              tick={{
                fontSize: 11,
                fill: "color-mix(in srgb, var(--on-surface-dim) 80%, transparent)",
                fontFamily: "monospace",
              }}
              tickLine={false}
              tickMargin={12}
            />
          )}
          <ReferenceLine
            y={mid}
            stroke="color-mix(in srgb, var(--glass-border) 80%, transparent)"
            strokeDasharray="4 4"
          />
          <Tooltip
            cursor={{
              stroke: "color-mix(in srgb, var(--secondary) 60%, transparent)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            contentStyle={tooltipStyle}
            itemStyle={{ color: "var(--secondary)", fontWeight: 600, fontSize: "14px" }}
            labelFormatter={() => ""}
            formatter={(value) => [value ?? "", "activity"]}
          />
          <Area
            dataKey="value"
            fill="url(#areaGradientHero)"
            isAnimationActive
            animationDuration={1200}
            stroke="var(--secondary)"
            strokeWidth={2.5}
            type="monotone"
            style={{ filter: "url(#areaGlow)" }}
          />
          {showContext && (
            <Line
              dataKey="value"
              dot={{
                r: 3,
                fill: "var(--surface)",
                stroke: "var(--secondary)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5, fill: "var(--surface)", stroke: "var(--secondary)", strokeWidth: 2 }}
              stroke="transparent"
              type="monotone"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * DashboardBarChart - clean minimal bars. No axes. Perfect for KPI cards.
 */
export function DashboardBarChart({
  data,
  height = 48,
  labels,
}: {
  data: number[];
  height?: number;
  labels?: string[];
}) {
  const uniqueId = useId().replace(/:/g, "");
  const points: ChartPoint[] = data.map((value, index) => ({
    index,
    label: labels?.[index] ?? String(index + 1),
    value,
  }));
  const showContext = height >= 120;
  const startVal = data[0];
  const endVal = data[data.length - 1];
  const avgVal = parseFloat((data.reduce((sum, v) => sum + v, 0) / data.length).toFixed(1));

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            margin={{
              bottom: showContext ? 18 : 0,
              left: showContext ? 2 : 0,
              right: showContext ? 8 : 0,
              top: showContext ? 18 : 2,
            }}
            barCategoryGap={showContext ? "30%" : "24%"}
          >
            <defs>
              <linearGradient id={`barGrad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                <stop
                  offset="100%"
                  stopColor="color-mix(in srgb, var(--secondary) 80%, transparent)"
                  stopOpacity={0.4}
                />
              </linearGradient>
            </defs>
            {showContext && (
              <CartesianGrid
                stroke="color-mix(in srgb, var(--glass-border) 40%, transparent)"
                strokeDasharray="4 6"
                vertical={false}
              />
            )}
            {showContext && (
              <YAxis
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: "color-mix(in srgb, var(--on-surface-dim) 80%, transparent)",
                  fontFamily: "monospace",
                }}
                tickLine={false}
                width={36}
              />
            )}
            {showContext && (
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{
                  fontSize: 11,
                  fill: "color-mix(in srgb, var(--on-surface-dim) 80%, transparent)",
                  fontFamily: "monospace",
                }}
                tickLine={false}
                tickMargin={12}
              />
            )}
            <Tooltip
              cursor={{
                fill: "color-mix(in srgb, var(--primary) 10%, transparent)",
                radius: 6,
              }}
              contentStyle={tooltipStyle}
              itemStyle={{ color: "var(--primary)", fontWeight: 600, fontSize: "14px" }}
              labelFormatter={(label, items) => {
                const p = items[0]?.payload as ChartPoint | undefined;
                return p?.label ? `Point: ${p.label}` : `Index ${label + 1}`;
              }}
              formatter={(value) => [`Value: ${value}`, ""]}
            />
            <Bar
              dataKey="value"
              fill={`url(#barGrad-${uniqueId})`}
              isAnimationActive
              animationDuration={1000}
              radius={[6, 6, 0, 0]}
            >
              {showContext && (
                <LabelList
                  dataKey="value"
                  fill="var(--on-surface)"
                  fontFamily="monospace"
                  fontSize={11}
                  position="top"
                  offset={10}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!showContext && (
        <div className="flex w-full items-center justify-between mt-3 text-[0.68rem] font-mono text-[var(--on-surface-dim)] opacity-90 px-1">
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">START: {startVal}</span>
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">AVG: {avgVal}</span>
          <span className="bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">END: {endVal}</span>
        </div>
      )}
    </div>
  );
}

/**
 * DashboardDonutChart - segmented ring chart for supply health, etc.
 */
export function DashboardDonutChart({
  data,
  height = 132,
  legend = "stack",
  thickness = "slim",
}: {
  data: Array<{
    label: string;
    value: number;
    tone?: "primary" | "secondary" | "success" | "muted";
  }>;
  height?: number;
  legend?: "stack" | "inline";
  thickness?: "slim" | "medium";
}) {
  const colors = {
    muted: "color-mix(in srgb, var(--on-surface-dim) 40%, transparent)",
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    success: "var(--tertiary)",
  };
  const innerRadius = thickness === "slim" ? "70%" : "62%";
  const outerRadius = thickness === "slim" ? "88%" : "90%";

  return (
    <div style={{ minHeight: height }} className="grid w-full gap-5">
      <div style={{ height }} className="min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <defs>
              <filter
                id="donutGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "var(--on-surface)", fontWeight: 600, fontSize: "14px" }}
              labelStyle={{ display: "none" }}
              formatter={(value, name) => [value, name]}
            />
            <Pie
              data={data}
              dataKey="value"
              innerRadius={innerRadius}
              isAnimationActive
              animationDuration={1200}
              nameKey="label"
              outerRadius={outerRadius}
              paddingAngle={5}
              stroke="none"
              cornerRadius={4}
            >
              {data.map((item) => (
                <Cell
                  key={item.label}
                  fill={colors[item.tone ?? "muted"]}
                  style={{ filter: "url(#donutGlow)" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div
        className={
          legend === "inline" ? "grid gap-2.5 sm:grid-cols-2 md:grid-cols-4" : "grid gap-2.5"
        }
      >
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] px-3.5 py-2.5 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                style={{ background: colors[item.tone ?? "muted"] }}
              />
              <span className="truncate text-[0.8rem] font-medium text-[var(--on-surface-dim)]">
                {item.label}
              </span>
            </span>
            <span className="font-mono text-[0.86rem] font-medium text-[var(--on-surface)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
