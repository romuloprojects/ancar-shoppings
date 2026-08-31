import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Leaf } from "lucide-react";
import type { ESGMetrics } from "@/types";

const circumference = 2 * Math.PI * 42;
const segmentLength = circumference / 3;
const segmentGap = 9;

const scoreItems = [
  { key: "ambiental", label: "Ambiental", color: "var(--accent-green)" },
  { key: "social", label: "Social", color: "var(--accent-cyan)" },
  { key: "governanca", label: "Governança", color: "var(--accent-purple)" },
] as const;

export function ESGScoreCard({ metrics }: { metrics: ESGMetrics }) {
  const status = getScoreStatus(metrics.esgScore);

  return (
    <section className="panel flex h-full min-h-[330px] flex-col overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">ESG Score Médio</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Desempenho consolidado</p>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-[color-mix(in_oklab,var(--accent-green)_28%,transparent)] bg-[color-mix(in_oklab,var(--accent-green)_10%,transparent)] text-[var(--accent-green)]">
          <Leaf className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </div>

      <div className="relative mx-auto mt-1 grid h-[154px] w-[154px] place-items-center">
        <div className="absolute inset-[21px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-cyan)_8%,transparent),transparent_66%)] blur-xl" />
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 -rotate-90 overflow-visible"
          role="img"
          aria-label={`ESG Score ${metrics.esgScore} de 100`}
        >
          <defs>
            <filter id="esgGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="oklch(0.28 0.03 260 / 72%)"
            strokeWidth="8"
          />
          {scoreItems.map((item, index) => {
            const value = metrics[item.key];
            const filledLength = Math.max(0, segmentLength - segmentGap) * (value / 100);
            const emptyLength = circumference - filledLength;
            const dashOffset = -(index * segmentLength + segmentGap / 2);

            return (
              <circle
                key={item.key}
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={item.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${filledLength} ${emptyLength}`}
                strokeDashoffset={dashOffset}
                filter="url(#esgGlow)"
              />
            );
          })}
        </svg>

        <div className="relative text-center">
          <div className="metric-value text-[34px] leading-none">{metrics.esgScore}</div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            de 100
          </div>
          <div className="mt-1.5 text-[10px] font-semibold text-[var(--accent-green)]">
            {status}
          </div>
        </div>
      </div>

      <div className="mt-1 space-y-2">
        {scoreItems.map((item) => (
          <ScoreRow
            key={item.key}
            label={item.label}
            value={metrics[item.key]}
            color={item.color}
          />
        ))}
      </div>

      <Link
        to="/esg"
        className="group mt-auto flex h-9 items-center justify-center gap-2 rounded-lg border border-border/55 bg-muted/15 px-3 text-[11px] font-medium transition-all hover:border-[color-mix(in_oklab,var(--accent-cyan)_45%,transparent)] hover:bg-[color-mix(in_oklab,var(--accent-cyan)_7%,transparent)]"
      >
        Ver detalhamento
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>
    </section>
  );
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[76px_1fr_26px] items-center gap-2 text-[10px]">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ color, background: color }}
        />
        {label}
      </span>
      <span className="h-1 overflow-hidden rounded-full bg-muted/50">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 9px color-mix(in oklab, ${color} 55%, transparent)`,
          }}
        />
      </span>
      <span className="metric-value text-right text-foreground">{value}</span>
    </div>
  );
}

function getScoreStatus(score: number) {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 55) return "Em evolução";
  return "Atenção";
}
