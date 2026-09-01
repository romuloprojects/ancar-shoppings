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

  return (
    <section className="panel flex h-full min-h-[330px] flex-col overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Qualidade dos Dados</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Saúde consolidada do portfólio</p>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-[color-mix(in_oklab,var(--accent-green)_28%,transparent)] bg-[color-mix(in_oklab,var(--accent-green)_10%,transparent)] text-[var(--accent-green)]">
          <Database className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </div>

      <div className="relative mx-auto mt-1 grid h-[154px] w-[154px] place-items-center">
        <div className="absolute inset-[21px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-cyan)_8%,transparent),transparent_66%)] blur-xl" />
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
            stroke="oklch(0.28 0.03 260 / 72%)"
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
          <div className="metric-value text-[34px] leading-none">{formatNumber(quality, { maximumFractionDigits: 0 })}</div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">%</div>
          <div className="mt-1.5 text-[10px] font-semibold text-[var(--accent-green)]">
            {quality >= 99 ? "Dados íntegros" : quality >= 80 ? "Acompanhar" : "Atenção"}
          </div>
        </div>
      </div>

      <div className="mt-1 space-y-2.5 text-[10px]">
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

      <div className="mt-auto rounded-lg border border-border/55 bg-muted/15 px-3 py-2 text-center text-[10px] text-muted-foreground">
        Atualização automática a cada 5 minutos
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
    <div className="grid grid-cols-[18px_1fr_auto] items-center gap-2 rounded-lg border border-border/35 bg-muted/10 px-2.5 py-2">
      <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={1.9} />
      <span className="text-muted-foreground">{label}</span>
      <span className="metric-value text-foreground">{value}</span>
    </div>
  );
}
