import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Accent = "cyan" | "blue" | "green" | "yellow" | "purple";

const accentMap: Record<Accent, { color: string; softColor: string }> = {
  cyan: {
    color: "var(--accent-cyan)",
    softColor: "color-mix(in oklab, var(--accent-cyan) 18%, transparent)",
  },
  blue: {
    color: "var(--accent-blue)",
    softColor: "color-mix(in oklab, var(--accent-blue) 18%, transparent)",
  },
  green: {
    color: "var(--accent-green)",
    softColor: "color-mix(in oklab, var(--accent-green) 18%, transparent)",
  },
  yellow: {
    color: "var(--accent-yellow)",
    softColor: "color-mix(in oklab, var(--accent-yellow) 18%, transparent)",
  },
  purple: {
    color: "var(--accent-purple)",
    softColor: "color-mix(in oklab, var(--accent-purple) 18%, transparent)",
  },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  accent?: Accent;
  series?: number[];
  invertDelta?: boolean;
}

interface SparklineGeometry {
  linePath: string;
  areaPath: string;
}

function buildSparklineGeometry(values: number[], width = 116, height = 52): SparklineGeometry {
  if (values.length === 0) {
    return { linePath: "", areaPath: "" };
  }

  const paddingX = 2;
  const paddingY = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = values.map((value, index) => {
    const x = paddingX + (index / Math.max(values.length - 1, 1)) * usableWidth;
    const y = paddingY + (1 - (value - min) / range) * usableHeight;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`;

  return { linePath, areaPath };
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  deltaLabel = "vs ontem",
  accent = "cyan",
  series,
  invertDelta,
}: Props) {
  const accentStyle = accentMap[accent];
  const chartValues = series ?? [3, 5, 4, 7, 6, 8, 6, 9, 7, 10, 8, 11];
  const { linePath, areaPath } = buildSparklineGeometry(chartValues);
  const positive = delta !== undefined ? (invertDelta ? delta < 0 : delta > 0) : true;
  const gradientId = `kpi-sparkline-${accent}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const cardGlowStyle = {
    "--kpi-accent": accentStyle.color,
    background: `radial-gradient(circle at 14% 50%, ${accentStyle.softColor}, transparent 48%)`,
  } as CSSProperties;

  return (
    <article
      className="panel group relative h-[116px] min-w-0 overflow-hidden px-3.5 py-3 transition-colors duration-200 hover:border-[color-mix(in_oklab,var(--kpi-accent)_32%,var(--border))] 2xl:px-4"
      style={cardGlowStyle}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative flex h-full min-w-0 items-center gap-2.5 2xl:gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border shadow-[inset_0_1px_0_rgb(255_255_255/6%),0_8px_26px_-16px_var(--kpi-accent)] 2xl:h-14 2xl:w-14"
          style={{
            color: accentStyle.color,
            borderColor: `color-mix(in oklab, ${accentStyle.color} 42%, transparent)`,
            background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${accentStyle.color} 24%, transparent), color-mix(in oklab, ${accentStyle.color} 10%, var(--card)) 72%)`,
          }}
        >
          <Icon className="h-6 w-6 2xl:h-7 2xl:w-7" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium leading-none text-foreground/82 2xl:text-xs">
            {label}
          </div>

          <div className="mt-2 flex min-w-0 items-baseline gap-1.5">
            <span className="metric-value truncate text-[25px] leading-none text-foreground 2xl:text-[28px]">
              {value}
            </span>
            {unit && (
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground 2xl:text-xs">
                {unit}
              </span>
            )}
          </div>

          {delta !== undefined && (
            <div className="mt-2 flex min-w-0 items-center gap-1 text-[10px] leading-none 2xl:text-[11px]">
              {positive ? (
                <ArrowUpRight
                  className="h-3 w-3 shrink-0 text-[var(--accent-green)]"
                  strokeWidth={2.2}
                />
              ) : (
                <ArrowDownRight
                  className="h-3 w-3 shrink-0 text-[var(--accent-red)]"
                  strokeWidth={2.2}
                />
              )}
              <span
                className={`shrink-0 font-semibold ${
                  positive ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)}%
              </span>
              <span className="truncate text-muted-foreground">{deltaLabel}</span>
            </div>
          )}
        </div>

        <div className="hidden h-[58px] w-16 shrink-0 self-center opacity-95 xl:block 2xl:w-[104px]">
          <svg
            viewBox="0 0 116 52"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentStyle.color} stopOpacity="0.34" />
                <stop offset="100%" stopColor={accentStyle.color} stopOpacity="0" />
              </linearGradient>
              <filter id={`${gradientId}-glow`} x="-20%" y="-30%" width="140%" height="160%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={accentStyle.color}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              filter={`url(#${gradientId}-glow)`}
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
