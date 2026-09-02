import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type Accent = "cyan" | "blue" | "green" | "yellow" | "purple" | "orange";
type ComparisonTone = "neutral" | "lower-better" | "higher-better";

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
  orange: {
    color: "var(--accent-orange)",
    softColor: "color-mix(in oklab, var(--accent-orange) 18%, transparent)",
  },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  comparisonValue?: number | null;
  comparisonLabel?: string;
  comparisonUnit?: "%" | "°C" | "ch";
  comparisonTone?: ComparisonTone;
  accent?: Accent;
}

function comparisonColor(
  delta: number,
  tone: ComparisonTone,
  accentColor: string,
): string {
  if (delta === 0) return "var(--muted-foreground)";
  if (tone === "neutral") return accentColor;
  const isBetter = tone === "lower-better" ? delta < 0 : delta > 0;
  return isBetter ? "var(--accent-green)" : "var(--accent-red)";
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  comparisonValue,
  comparisonLabel = "vs período anterior",
  comparisonUnit = "%",
  comparisonTone = "neutral",
  accent = "cyan",
}: Props) {
  const accentStyle = accentMap[accent];
  const hasComparison = comparisonValue !== null && comparisonValue !== undefined && Number.isFinite(comparisonValue);
  const comparison = hasComparison ? comparisonValue : null;
  const comparisonAccent = comparison === null
    ? "var(--muted-foreground)"
    : comparisonColor(comparison, comparisonTone, accentStyle.color);

  const cardGlowStyle = {
    "--kpi-accent": accentStyle.color,
    background: `radial-gradient(circle at 14% 50%, ${accentStyle.softColor}, transparent 52%)`,
  } as CSSProperties;

  return (
    <article
      className="panel group relative h-[92px] min-w-0 overflow-hidden px-2.5 py-2.5 transition-colors duration-200 hover:border-[color-mix(in_oklab,var(--kpi-accent)_32%,var(--border))] 2xl:px-3"
      style={cardGlowStyle}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative flex h-full min-w-0 items-center gap-2.5">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border shadow-[inset_0_1px_0_rgb(255_255_255/6%),0_8px_26px_-16px_var(--kpi-accent)] 2xl:h-11 2xl:w-11"
          style={{
            color: accentStyle.color,
            borderColor: `color-mix(in oklab, ${accentStyle.color} 42%, transparent)`,
            background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${accentStyle.color} 24%, transparent), color-mix(in oklab, ${accentStyle.color} 10%, var(--card)) 72%)`,
          }}
        >
          <Icon className="h-5 w-5 2xl:h-5.5 2xl:w-5.5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-medium leading-none text-foreground/82 2xl:text-[11px]">
            {label}
          </div>

          <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5">
            <span className="metric-value truncate text-[22px] leading-none text-foreground 2xl:text-[24px]">
              {value}
            </span>
            {unit && (
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground 2xl:text-[11px]">
                {unit}
              </span>
            )}
          </div>

          <div
            className="mt-1.5 flex min-w-0 items-center gap-1 text-[9px] leading-none 2xl:text-[10px]"
            title="Comparação entre a média do período selecionado e a média do período imediatamente anterior equivalente."
          >
            {comparison === null ? (
              <>
                <Minus className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2} />
                <span className="truncate text-muted-foreground">Sem comparativo · {comparisonLabel}</span>
              </>
            ) : (
              <>
                {comparison > 0 ? (
                  <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={2.2} style={{ color: comparisonAccent }} />
                ) : comparison < 0 ? (
                  <ArrowDownRight className="h-3 w-3 shrink-0" strokeWidth={2.2} style={{ color: comparisonAccent }} />
                ) : (
                  <Minus className="h-3 w-3 shrink-0" strokeWidth={2.2} style={{ color: comparisonAccent }} />
                )}
                <span className="shrink-0 font-semibold" style={{ color: comparisonAccent }}>
                  {comparison > 0 ? "+" : ""}{comparison.toFixed(1).replace(".", ",")}{comparisonUnit}
                </span>
                <span className="truncate text-muted-foreground">{comparisonLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
