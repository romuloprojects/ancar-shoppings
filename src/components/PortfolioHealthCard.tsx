import { Activity, CheckCircle2, CircleOff, Database, type LucideIcon } from "lucide-react";
import { formatNumber } from "@/utils/format";

export interface PortfolioHealthMetrics {
  qualityPct: number;
  pointsOk: number;
  pointsTotal: number;
  online: number;
  totalShoppings: number;
  stale: number;
}

const circumference = 2 * Math.PI * 42;

export function PortfolioHealthCard({ metrics }: { metrics: PortfolioHealthMetrics }) {
  const quality = Math.max(0, Math.min(100, metrics.qualityPct));
  const dash = (quality / 100) * circumference;
  const qualityLabel = quality >= 99 ? "Dados íntegros" : quality >= 80 ? "Acompanhar" : "Atenção";

  return (
    <section className="panel portfolio-health-card flex h-full min-h-0 flex-col overflow-hidden p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">Qualidade dos Dados</h2>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Saúde consolidada do portfólio</p>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[color-mix(in_oklab,var(--accent-green)_28%,transparent)] bg-[color-mix(in_oklab,var(--accent-green)_10%,transparent)] text-[var(--accent-green)]">
          <Database className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </div>

      <div className="portfolio-health-gauge-wrap mt-1 flex shrink-0 flex-col items-center">
        <div className="portfolio-health-gauge relative grid h-[56px] w-[56px] place-items-center">
          <div className="absolute inset-[14px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-cyan)_8%,transparent),transparent_66%)] blur-xl" />
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90 overflow-visible"
            role="img"
            aria-label={`Qualidade dos dados ${quality.toFixed(0)} por cento`}
          >
            <defs>
              <filter id="qualityGlow" x="-50%" y="-50%" width="200%" height="200%">
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
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--accent-green)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              filter="url(#qualityGlow)"
            />
          </svg>

          <div className="relative text-center">
            <div className="metric-value text-[11px] leading-none">
              {formatNumber(quality, { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-muted-foreground">%</div>
          </div>
        </div>
        <div className="portfolio-health-label -mt-0.5 text-center text-[9px] font-semibold leading-none text-[var(--accent-green)]">
          {qualityLabel}
        </div>
      </div>

      <div className="portfolio-health-rows mt-2 space-y-1.5 text-[10px]">
        <HealthRow
          icon={CheckCircle2}
          label="Pontos OK"
          value={`${metrics.pointsOk} / ${metrics.pointsTotal}`}
          color="var(--accent-green)"
        />
        <HealthRow
          icon={Activity}
          label="Shoppings online"
          value={`${metrics.online} / ${metrics.totalShoppings}`}
          color="var(--accent-cyan)"
        />
        <HealthRow
          icon={CircleOff}
          label="Dados desatualizados"
          value={String(metrics.stale)}
          color={metrics.stale > 0 ? "var(--accent-yellow)" : "var(--accent-green)"}
        />
      </div>

      <div className="portfolio-health-footer mt-auto rounded-lg border border-border/55 bg-muted/15 px-2.5 py-1.5 text-center text-[9px] leading-tight text-muted-foreground">
        Atualização automática a cada 3 minutos
      </div>
    </section>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="grid min-h-7 grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-1.5 rounded-lg border border-border/35 bg-muted/10 px-2 py-1.5">
      <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={1.9} />
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="metric-value whitespace-nowrap text-foreground">{value}</span>
    </div>
  );
}
