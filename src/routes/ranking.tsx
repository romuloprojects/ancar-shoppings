import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, Medal, Sparkles, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { RankingItem } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, InternalPage, StatCard } from "@/components/InternalPage";
import { formatNumber } from "@/utils/format";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking" }] }),
  component: RankingPage,
});

type Metric =
  "eficiencia" | "consumo" | "economia" | "esg" | "qualidade" | "alertas" | "disponibilidade";

const METRICS: { key: Metric; label: string }[] = [
  { key: "eficiencia", label: "Eficiência" },
  { key: "consumo", label: "Consumo" },
  { key: "economia", label: "Economia" },
  { key: "esg", label: "ESG" },
  { key: "qualidade", label: "Qualidade dos dados" },
  { key: "alertas", label: "Alertas" },
  { key: "disponibilidade", label: "Disponibilidade" },
];

const LOWER_IS_BETTER = new Set<Metric>(["eficiencia", "consumo", "alertas"]);

function RankingPage() {
  const [metric, setMetric] = useState<Metric>("eficiencia");
  const [period, setPeriod] = useState("Últimos 30 dias");
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    dashboardService.getRanking(metric).then((result) => {
      if (!alive) return;
      setItems(result);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [metric]);

  const summary = useMemo(() => {
    const leader = items[0];
    const average = items.length
      ? items.reduce((total, item) => total + item.value, 0) / items.length
      : 0;
    const improving = items.filter((item) => item.trend > 0).length;
    return { leader, average, improving };
  }, [items]);

  const values = items.map((item) => item.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(max - min, 0.0001);
  const lowerIsBetter = LOWER_IS_BETTER.has(metric);

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Benchmark do portfólio"
        title="Ranking"
        subtitle="Compare desempenho, qualidade e disponibilidade entre todos os shoppings."
        icon={Trophy}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Líder atual"
          value={summary.leader?.code ?? "—"}
          detail={summary.leader?.name ?? "Aguardando dados"}
          icon={Medal}
          accent="yellow"
        />
        <StatCard
          label="Valor do líder"
          value={
            summary.leader ? formatNumber(summary.leader.value, { maximumFractionDigits: 2 }) : "—"
          }
          unit={summary.leader?.unit}
          icon={Award}
          accent="green"
        />
        <StatCard
          label="Média do portfólio"
          value={formatNumber(summary.average, { maximumFractionDigits: 2 })}
          unit={summary.leader?.unit}
          icon={BarChart3}
          accent="blue"
        />
        <StatCard
          label="Tendência positiva"
          value={summary.improving}
          unit={`de ${items.length}`}
          detail="Comparativo com o período anterior"
          icon={Sparkles}
          accent="cyan"
        />
      </div>

      <FilterBar className="items-center">
        <div className="segmented-control max-w-full overflow-x-auto">
          {METRICS.map((option) => (
            <button
              key={option.key}
              type="button"
              data-active={metric === option.key}
              onClick={() => setMetric(option.key)}
              className="whitespace-nowrap"
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex min-w-[180px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Período
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
          >
            {["Hoje", "Últimos 7 dias", "Últimos 30 dias", "Este mês"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </FilterBar>

      {loading ? (
        <LoadingBlock h={520} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Ranking indisponível"
          description="Não há dados suficientes para calcular esta classificação no período selecionado."
          icon={Trophy}
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[64px_minmax(220px,1.4fr)_minmax(180px,1fr)_150px_120px_112px] gap-4 border-b border-border/50 bg-muted/25 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
            <span>Posição</span>
            <span>Shopping</span>
            <span>Desempenho relativo</span>
            <span className="text-right">Valor</span>
            <span className="text-right">Tendência</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-border/40">
            {items.map((item) => {
              const normalized = lowerIsBetter
                ? ((max - item.value) / range) * 100
                : ((item.value - min) / range) * 100;
              const barWidth = Math.max(8, Math.min(100, normalized));
              return (
                <div
                  key={item.shoppingId}
                  className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-[color-mix(in_oklab,var(--accent-cyan)_4%,transparent)] lg:grid-cols-[64px_minmax(220px,1.4fr)_minmax(180px,1fr)_150px_120px_112px] lg:items-center lg:gap-4"
                >
                  <div className="flex items-center gap-2 lg:block">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold ${
                        item.position <= 3
                          ? "bg-[var(--accent-yellow)]/12 text-[var(--accent-yellow)]"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {item.position}
                    </span>
                    <span className="text-xs text-muted-foreground lg:hidden">posição</span>
                  </div>
                  <div className="min-w-0">
                    <Link
                      to="/shoppings/$shoppingId"
                      params={{ shoppingId: item.shoppingId }}
                      className="font-medium hover:text-[var(--accent-cyan)]"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">{item.code}</div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/45">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="metric-value text-sm lg:text-right">
                    {formatNumber(item.value, { maximumFractionDigits: 2 })}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs lg:justify-end">
                    {item.trend >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--accent-green)]" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-[var(--accent-red)]" />
                    )}
                    <span
                      className={
                        item.trend >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"
                      }
                    >
                      {item.trend > 0 ? "+" : ""}
                      {item.trend}%
                    </span>
                  </div>
                  <div className="lg:flex lg:justify-end">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </InternalPage>
  );
}
