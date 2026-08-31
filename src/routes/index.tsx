import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bolt, ChevronLeft, ChevronRight, DollarSign, Droplet, Gauge, Leaf } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type {
  EnergyDataPoint,
  ESGMetrics,
  Insight,
  PortfolioKpi,
  RankingItem,
  Shopping,
  ShoppingStatus,
} from "@/types";
import { KpiCard } from "@/components/KpiCard";
import { ShoppingCard } from "@/components/ShoppingCard";
import { BrazilMap } from "@/components/BrazilMap";
import { LoadingBlock } from "@/components/ui-helpers";
import { formatNumber } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { StatusDot } from "@/components/StatusBadge";
import { InsightCard } from "@/components/InsightCard";
import { ESGScoreCard } from "@/components/ESGScoreCard";

type ChartPeriod = "24h" | "7d" | "30d";
type RankingMetric = "eficiencia" | "consumo" | "esg" | "economia";

const rankingOptions: Record<
  RankingMetric,
  { label: string; unit: string; lowerIsBetter: boolean }
> = {
  eficiencia: { label: "Eficiência", unit: "kW/TR", lowerIsBetter: true },
  consumo: { label: "Consumo", unit: "MWh", lowerIsBetter: true },
  esg: { label: "ESG Score", unit: "pts", lowerIsBetter: false },
  economia: { label: "Economia", unit: "R$ mil", lowerIsBetter: false },
};

const statusColor: Record<ShoppingStatus, string> = {
  otimo: "var(--accent-green)",
  bom: "var(--accent-cyan)",
  atencao: "var(--accent-yellow)",
  critico: "var(--accent-red)",
  offline: "var(--muted-foreground)",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral" },
      {
        name: "description",
        content: "Visão geral do desempenho energético e ESG do portfólio de shoppings.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const { tick } = useDashboardRuntime();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("24h");
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>("eficiencia");
  const [portfolioPage, setPortfolioPage] = useState(0);
  const [data, setData] = useState<{
    kpi: PortfolioKpi;
    series: EnergyDataPoint[];
    ranking: RankingItem[];
    shoppings: Shopping[];
    insights: Insight[];
    esg: ESGMetrics;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    dashboardService.getPortfolioOverview().then((result) => {
      if (alive) setData(result);
    });
    return () => {
      alive = false;
    };
  }, [tick]);

  const chartData = useMemo(
    () => (data ? makeChartSeries(data.series, chartPeriod) : []),
    [data, chartPeriod],
  );

  const ranking = useMemo(
    () => (data ? makeOverviewRanking(data.shoppings, rankingMetric) : []),
    [data, rankingMetric],
  );

  if (!data) {
    return <LoadingBlock h={880} />;
  }

  const selectedRanking = rankingOptions[rankingMetric];
  const rankingValues = ranking.map((item) => item.value);
  const rankingMin = Math.min(...rankingValues);
  const rankingMax = Math.max(...rankingValues);
  const portfolioPageSize = 6;
  const portfolioPageCount = Math.ceil(data.shoppings.length / portfolioPageSize);
  const safePortfolioPage = Math.min(portfolioPage, portfolioPageCount - 1);
  const portfolioItems = data.shoppings.slice(
    safePortfolioPage * portfolioPageSize,
    safePortfolioPage * portfolioPageSize + portfolioPageSize,
  );

  return (
    <div className="overview-dashboard space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={Bolt}
          label="Potência Total"
          value={formatNumber(data.kpi.potenciaTotalMW, { maximumFractionDigits: 1 })}
          unit="MW"
          delta={data.kpi.deltaPotencia}
          accent="cyan"
        />
        <KpiCard
          icon={Droplet}
          label="Consumo Hoje"
          value={formatNumber(data.kpi.consumoHojeMWh)}
          unit="MWh"
          delta={data.kpi.deltaConsumo}
          accent="blue"
          invertDelta
        />
        <KpiCard
          icon={Gauge}
          label="Eficiência Média"
          value={formatNumber(data.kpi.eficienciaMediaKWTR, { maximumFractionDigits: 2 })}
          unit="kW/TR"
          delta={data.kpi.deltaEficiencia}
          accent="green"
          invertDelta
        />
        <KpiCard
          icon={Leaf}
          label="CO₂ Evitado"
          value={formatNumber(data.kpi.co2EvitadoT, { maximumFractionDigits: 1 })}
          unit="t"
          delta={data.kpi.deltaCO2}
          accent="yellow"
        />
        <KpiCard
          icon={DollarSign}
          label="Economia Estimada"
          value={`R$${formatNumber(data.kpi.economiaEstimadaBRL)}`}
          unit="mil"
          delta={data.kpi.deltaEconomia}
          accent="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="panel p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Eficiência e Consumo</h2>
              <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-green)]" />
                  Eficiência (kW/TR)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)]" />
                  Consumo (MWh)
                </span>
              </div>
            </div>
            <select
              value={chartPeriod}
              onChange={(event) => setChartPeriod(event.target.value as ChartPeriod)}
              aria-label="Período do gráfico"
              className="h-8 rounded-md border border-border/60 bg-card/60 px-2.5 text-xs text-foreground outline-none focus:border-primary/60"
            >
              <option value="24h">24h</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
            </select>
          </div>

          <div className="overview-chart h-[272px] 2xl:h-[286px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="consumoArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="oklch(0.35 0.03 260 / 30%)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="oklch(0.6 0.02 250)"
                  tick={{ fontSize: 10 }}
                  minTickGap={chartPeriod === "30d" ? 18 : 8}
                  tickLine={false}
                  axisLine={{ stroke: "oklch(0.38 0.03 260 / 60%)" }}
                />
                <YAxis
                  yAxisId="l"
                  domain={[0, 1.2]}
                  stroke="oklch(0.6 0.02 250)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  stroke="oklch(0.6 0.02 250)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.03 260)",
                    border: "1px solid oklch(0.35 0.03 260)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Area
                  yAxisId="r"
                  type="monotone"
                  dataKey="consumo"
                  name="Consumo"
                  stroke="var(--accent-blue)"
                  strokeWidth={2}
                  fill="url(#consumoArea)"
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="l"
                  type="monotone"
                  dataKey="eficiencia"
                  name="Eficiência"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  dot={{ r: 2.4, fill: "var(--accent-green)", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Ranking dos Shoppings</h2>
            <select
              value={rankingMetric}
              onChange={(event) => setRankingMetric(event.target.value as RankingMetric)}
              aria-label="Métrica do ranking"
              className="h-8 rounded-md border border-border/60 bg-card/60 px-2.5 text-xs text-foreground outline-none focus:border-primary/60"
            >
              {Object.entries(rankingOptions).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label} ({option.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            {ranking.slice(0, 8).map((item) => {
              const width = getRankingWidth(
                item.value,
                rankingMin,
                rankingMax,
                selectedRanking.lowerIsBetter,
              );
              const color = statusColor[item.status];

              return (
                <Link
                  key={item.shoppingId}
                  to="/shoppings/$shoppingId"
                  params={{ shoppingId: item.shoppingId }}
                  className="group grid grid-cols-[24px_minmax(210px,1fr)_minmax(150px,0.9fr)_72px_10px] items-center gap-3 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/30"
                >
                  <span className="text-right text-xs text-muted-foreground">{item.position}</span>
                  <span className="min-w-0 truncate font-medium">
                    {item.name}{" "}
                    <span className="font-normal text-muted-foreground">({item.code})</span>
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                    <span
                      className="block h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 74%, white))`,
                        boxShadow: `0 0 10px color-mix(in oklab, ${color} 48%, transparent)`,
                      }}
                    />
                  </span>
                  <span className="metric-value whitespace-nowrap text-right text-xs">
                    {formatRankingValue(item.value, rankingMetric)}
                  </span>
                  <StatusDot status={item.status} />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel p-4 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Visão do Portfólio
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({data.shoppings.length} Shoppings)
              </span>
            </h2>
            <Link to="/shoppings" className="text-xs text-[var(--accent-cyan)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((shopping) => (
              <ShoppingCard key={shopping.id} shopping={shopping} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
            <span>
              Exibindo {safePortfolioPage * portfolioPageSize + 1}–
              {Math.min((safePortfolioPage + 1) * portfolioPageSize, data.shoppings.length)} de{" "}
              {data.shoppings.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={safePortfolioPage === 0}
                onClick={() => setPortfolioPage((page) => Math.max(0, page - 1))}
                className="grid h-7 w-7 place-items-center rounded-md border border-border/55 bg-muted/15 transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: portfolioPageCount }, (_, page) => (
                <button
                  type="button"
                  key={page}
                  aria-label={`Ir para a página ${page + 1}`}
                  aria-current={page === safePortfolioPage ? "page" : undefined}
                  onClick={() => setPortfolioPage(page)}
                  className={`grid h-7 min-w-7 place-items-center rounded-md border px-2 text-[10px] font-medium transition-colors ${
                    page === safePortfolioPage
                      ? "border-primary/55 bg-primary/12 text-primary"
                      : "border-border/55 bg-muted/15 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                type="button"
                aria-label="Próxima página"
                disabled={safePortfolioPage === portfolioPageCount - 1}
                onClick={() =>
                  setPortfolioPage((page) => Math.min(portfolioPageCount - 1, page + 1))
                }
                className="grid h-7 w-7 place-items-center rounded-md border border-border/55 bg-muted/15 transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="panel p-4 xl:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">Mapa / Distribuição</h2>
          <BrazilMap items={data.shoppings} />
        </section>

        <section className="panel flex h-full min-h-[330px] flex-col p-4 xl:col-span-2">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Oportunidades / Insights</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Prioridades do portfólio</p>
            </div>
            <Link
              to="/analises"
              className="text-[10px] font-medium text-[var(--accent-cyan)] hover:underline"
            >
              Ver análises
            </Link>
          </div>
          <div className="grid flex-1 auto-rows-fr gap-2">
            {data.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        <div className="xl:col-span-2">
          <ESGScoreCard metrics={data.esg} />
        </div>
      </div>
    </div>
  );
}

function makeChartSeries(series: EnergyDataPoint[], period: ChartPeriod): EnergyDataPoint[] {
  if (period === "24h") return series;

  if (period === "7d") {
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return labels.map((time, index) => {
      const source = series[(index * 3 + 4) % series.length];
      return {
        time,
        eficiencia: Number((source.eficiencia + ((index % 3) - 1) * 0.025).toFixed(2)),
        consumo: Number((source.consumo * 13.2 + index * 2.4).toFixed(1)),
      };
    });
  }

  return Array.from({ length: 30 }, (_, index) => {
    const source = series[(index * 5 + 2) % series.length];
    const weeklyWave = Math.sin((index / 30) * Math.PI * 4);
    return {
      time: String(index + 1).padStart(2, "0"),
      eficiencia: Number((source.eficiencia + weeklyWave * 0.035).toFixed(2)),
      consumo: Number((source.consumo * 12.4 + weeklyWave * 9 + 18).toFixed(1)),
    };
  });
}

function makeOverviewRanking(shoppings: Shopping[], metric: RankingMetric): RankingItem[] {
  const option = rankingOptions[metric];
  const items = shoppings.map((shopping) => {
    let value: number;

    switch (metric) {
      case "consumo":
        value = shopping.consumptionMWh;
        break;
      case "esg":
        value = shopping.esgScore;
        break;
      case "economia":
        value = (shopping.savingsBRL ?? 0) / 1000;
        break;
      default:
        value = shopping.efficiencyKWTR;
    }

    return {
      shopping,
      value,
    };
  });

  items.sort((a, b) => (option.lowerIsBetter ? a.value - b.value : b.value - a.value));

  return items.map(({ shopping, value }, index) => ({
    position: index + 1,
    shoppingId: shopping.id,
    code: shopping.code,
    name: shopping.name,
    value,
    unit: option.unit,
    trend: 0,
    status: shopping.status,
  }));
}

function getRankingWidth(value: number, min: number, max: number, lowerIsBetter: boolean) {
  if (max === min) return 100;
  const normalized = (value - min) / (max - min);
  const score = lowerIsBetter ? 1 - normalized : normalized;
  return 36 + score * 64;
}

function formatRankingValue(value: number, metric: RankingMetric) {
  if (metric === "esg") return formatNumber(value, { maximumFractionDigits: 0 });
  if (metric === "economia") return `R$ ${formatNumber(value, { maximumFractionDigits: 1 })}`;
  return formatNumber(value, { maximumFractionDigits: 2 });
}
