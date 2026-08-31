import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Fan,
  Gauge,
  Thermometer,
  Zap,
} from "lucide-react";
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
import { dashboardService, mapLiveShoppingToLegacy } from "@/services/dashboardService";
import type {
  HistoryPeriod,
  Insight,
  LiveShoppingSummary,
  PortfolioApiResponse,
  Shopping,
  ShoppingApiResponse,
} from "@/types";
import { KpiCard } from "@/components/KpiCard";
import { ShoppingCard } from "@/components/ShoppingCard";
import { BrazilMap } from "@/components/BrazilMap";
import { InsightCard } from "@/components/InsightCard";
import { DataUnavailable } from "@/components/DataUnavailable";
import { LoadingBlock } from "@/components/ui-helpers";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { formatNumber, formatRelative } from "@/utils/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral | ANCAR CAG" },
      {
        name: "description",
        content: "Visão geral operacional da CAG e do portfólio ANCAR.",
      },
    ],
  }),
  component: OverviewPage,
});

type RankingMetric = "power" | "production" | "efficiency" | "quality";

const rankingOptions: Record<RankingMetric, { label: string; unit: string; ascending: boolean }> = {
  power: { label: "Potência CAG", unit: "kW", ascending: false },
  production: { label: "Produção térmica", unit: "TR", ascending: false },
  efficiency: { label: "kW/TR — CAGs elétricas", unit: "kW/TR", ascending: true },
  quality: { label: "Qualidade dos dados", unit: "%", ascending: false },
};

function n(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function OverviewPage() {
  const { tick } = useDashboardRuntime();
  const [portfolio, setPortfolio] = useState<PortfolioApiResponse | null>(null);
  const [selectedCode, setSelectedCode] = useState("BLD");
  const [period, setPeriod] = useState<HistoryPeriod>("24h");
  const [shoppingData, setShoppingData] = useState<ShoppingApiResponse | null>(null);
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>("power");
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    dashboardService
      .getPortfolioLive()
      .then((result) => {
        if (!alive) return;
        setPortfolio(result);
        let preferred = selectedCode;
        try {
          preferred = window.localStorage.getItem("ancar:selectedShopping") || preferred;
        } catch {}
        if (result.shoppings.some((item) => item.code === preferred)) {
          setSelectedCode(preferred);
        } else if (!result.shoppings.some((item) => item.code === selectedCode)) {
          setSelectedCode(result.shoppings[0]?.code ?? "");
        }
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Falha ao consultar a API ANCAR.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  useEffect(() => {
    if (!selectedCode) return;
    let alive = true;
    setHistoryLoading(true);
    dashboardService
      .getShoppingLive(selectedCode, period)
      .then((result) => {
        if (alive) setShoppingData(result);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Falha ao consultar histórico ANCAR.");
      })
      .finally(() => {
        if (alive) setHistoryLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedCode, period, tick]);

  const selectedSummary = useMemo(
    () => portfolio?.shoppings.find((item) => item.code === selectedCode) ?? null,
    [portfolio, selectedCode],
  );

  const portfolioCards = useMemo<Shopping[]>(
    () => (portfolio?.shoppings ?? []).map(mapLiveShoppingToLegacy),
    [portfolio],
  );

  const ranking = useMemo(() => {
    const opt = rankingOptions[rankingMetric];
    return (portfolio?.shoppings ?? [])
      .map((item) => {
        const k = item.latest?.kpis ?? {};
        const health = item.latest?.health ?? {};
        const total = n(health.pointsTotal) ?? item.registry.pointsTotal;
        const ok = n(health.pointsOk) ?? 0;
        const quality = total > 0 ? (ok / total) * 100 : null;
        const allElectric =
          k.modelo_energetico === "all_electric_chillers" ||
          (item.registry.chillersTotal > 0 && item.registry.chillersAbsorption === 0);
        let value: number | null = null;
        if (rankingMetric === "power") value = n(k.kw_cag);
        if (rankingMetric === "production") value = n(k.tr_total);
        if (rankingMetric === "efficiency") {
          value = allElectric ? n(k.kw_tr_eletrico_cag ?? k.kw_tr_cag) : null;
        }
        if (rankingMetric === "quality") value = quality;
        return { item, value };
      })
      .filter((row): row is { item: LiveShoppingSummary; value: number } => row.value !== null)
      .sort((a, b) => (opt.ascending ? a.value - b.value : b.value - a.value));
  }, [portfolio, rankingMetric]);

  const insights = useMemo(() => makePortfolioInsights(portfolio?.shoppings ?? []), [portfolio]);

  if (loading && !portfolio) return <LoadingBlock h={820} />;

  if (!portfolio || !selectedSummary) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-lg font-semibold">Visão Geral indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "Nenhum shopping ativo foi retornado pela API."}
        </p>
      </div>
    );
  }

  const latest = selectedSummary.latest;
  const k = latest?.kpis ?? {};
  const mixed =
    k.modelo_energetico === "mixed_absorption_electric" || selectedSummary.registry.chillersAbsorption > 0;
  const activeChillers = n(k.chillers_ativos ?? k.chillers_ativos_por_status);
  const totalChillers = selectedSummary.registry.chillersTotal;
  const kwTr = n(k.kw_tr_eletrico_cag ?? k.kw_tr_cag);
  const history = shoppingData?.shopping?.code === selectedCode ? shoppingData.history : [];
  const temperature = n(k.temperatura_externa_c);

  const historyKw = history.map((point) => point.kwCag).filter((value): value is number => value !== null);
  const historyTr = history.map((point) => point.trTotal).filter((value): value is number => value !== null);
  const historyKwTr = history.map((point) => point.kwTr).filter((value): value is number => value !== null);

  const selectShopping = (shopping: Shopping) => {
    setSelectedCode(shopping.code);
    try { window.localStorage.setItem("ancar:selectedShopping", shopping.code); } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="overview-dashboard space-y-4">
      <section className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-cyan)]">
            Visão Geral
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Panorama operacional</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            O topo acompanha o shopping selecionado; ranking, portfólio, mapa e insights representam a carteira.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="flex min-w-[260px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Shopping selecionado
            <select
              value={selectedCode}
              onChange={(event) => {
                const code = event.target.value;
                setSelectedCode(code);
                try { window.localStorage.setItem("ancar:selectedShopping", code); } catch {}
              }}
              className="h-10 rounded-lg border border-border/60 bg-background/60 px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
            >
              {portfolio.shoppings.map((shopping) => (
                <option key={shopping.code} value={shopping.code}>
                  {shopping.name} ({shopping.code})
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[150px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Período do gráfico
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as HistoryPeriod)}
              className="h-10 rounded-lg border border-border/60 bg-background/60 px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/8 px-3 py-2 text-xs text-[var(--accent-yellow)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={Zap}
          label="Potência CAG"
          value={display(n(k.kw_cag), 1)}
          unit="kW"
          accent="cyan"
          series={historyKw}
        />
        <KpiCard
          icon={Activity}
          label="Produção Térmica"
          value={display(n(k.tr_total), 1)}
          unit="TR"
          accent="blue"
          series={historyTr}
        />
        <KpiCard
          icon={Gauge}
          label={mixed ? "Intensidade Elétrica" : "Eficiência da CAG"}
          value={display(kwTr, 3)}
          unit="kW/TR"
          accent="green"
          series={historyKwTr}
        />
        <KpiCard
          icon={Building2}
          label="Chillers Ativos"
          value={activeChillers === null ? "—" : `${activeChillers} / ${totalChillers}`}
          accent="purple"
        />
        <KpiCard
          icon={Fan}
          label="Periféricos"
          value={display(n(k.kw_auxiliares), 1)}
          unit="kW"
          accent="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <section className="panel p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Comportamento da CAG</h2>
                <span className="rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {selectedSummary.code}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-cyan)]" /> Potência CAG (kW)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)]" /> Produção térmica (TR)
                </span>
                {temperature !== null && (
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-3 w-3 text-[var(--accent-yellow)]" /> {display(temperature, 1)} °C externo
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-[10px] text-muted-foreground">
              <div>Última coleta</div>
              <div className="mt-0.5 font-medium text-foreground">
                {latest?.collectedAt ? formatRelative(latest.collectedAt) : "Sem coleta"}
              </div>
            </div>
          </div>

          {historyLoading ? (
            <LoadingBlock h={286} />
          ) : history.length === 0 ? (
            <div className="grid h-[286px] place-items-center">
              <DataUnavailable label="Histórico ainda não disponível para este período" />
            </div>
          ) : (
            <div className="h-[286px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="kw-cag-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.35 0.03 260 / 30%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => formatChartTime(String(value), period)}
                    stroke="oklch(0.6 0.02 250)"
                    tick={{ fontSize: 9 }}
                    minTickGap={24}
                    tickLine={false}
                    axisLine={{ stroke: "oklch(0.38 0.03 260 / 60%)" }}
                  />
                  <YAxis
                    yAxisId="kw"
                    stroke="oklch(0.6 0.02 250)"
                    tick={{ fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <YAxis
                    yAxisId="tr"
                    orientation="right"
                    stroke="oklch(0.6 0.02 250)"
                    tick={{ fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(String(value)).toLocaleString("pt-BR")}
                    contentStyle={{
                      background: "oklch(0.20 0.03 260)",
                      border: "1px solid oklch(0.35 0.03 260)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Area
                    yAxisId="kw"
                    type="monotone"
                    dataKey="kwCag"
                    name="Potência CAG (kW)"
                    stroke="var(--accent-cyan)"
                    strokeWidth={2}
                    fill="url(#kw-cag-area)"
                    connectNulls
                  />
                  <Line
                    yAxisId="tr"
                    type="monotone"
                    dataKey="trTotal"
                    name="Produção térmica (TR)"
                    stroke="var(--accent-blue)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2 border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
            <span>{mixed ? "CAG com absorção: kW/TR representa intensidade elétrica." : "CAG totalmente elétrica."}</span>
            {n(k.cop_cag) !== null && <span>• COP atual: {display(n(k.cop_cag), 2)}</span>}
            {mixed && <span>• COP global não exibido sem energia térmica de entrada.</span>}
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Ranking dos Shoppings</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">Portfólio atual</p>
            </div>
            <select
              value={rankingMetric}
              onChange={(event) => setRankingMetric(event.target.value as RankingMetric)}
              className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-xs text-foreground outline-none"
            >
              {Object.entries(rankingOptions).map(([key, option]) => (
                <option key={key} value={key}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            {ranking.length === 0 ? (
              <DataUnavailable label="Nenhum shopping comparável nesta métrica" />
            ) : (
              ranking.slice(0, 8).map((row, index) => {
                const max = Math.max(...ranking.map((item) => item.value));
                const min = Math.min(...ranking.map((item) => item.value));
                const normalized = max === min ? 100 : rankingOptions[rankingMetric].ascending
                  ? 35 + ((max - row.value) / (max - min)) * 65
                  : 35 + ((row.value - min) / (max - min)) * 65;
                return (
                  <button
                    key={row.item.code}
                    type="button"
                    onClick={() => {
                      setSelectedCode(row.item.code);
                      try { window.localStorage.setItem("ancar:selectedShopping", row.item.code); } catch {}
                    }}
                    className="grid w-full grid-cols-[24px_minmax(150px,1fr)_minmax(100px,.8fr)_74px] items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-muted/20"
                  >
                    <span className="text-center text-[11px] text-muted-foreground">{index + 1}</span>
                    <span className="truncate text-xs font-medium">
                      {row.item.name} <span className="text-muted-foreground">({row.item.code})</span>
                    </span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-muted/35">
                      <span
                        className="block h-full rounded-full bg-[var(--accent-cyan)]"
                        style={{ width: `${normalized}%` }}
                      />
                    </span>
                    <span className="text-right text-xs font-semibold">
                      {display(row.value, rankingMetric === "efficiency" ? 2 : 0)} {rankingOptions[rankingMetric].unit}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel p-4 xl:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Visão do Portfólio</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">{portfolioCards.length} shoppings monitorados</p>
            </div>
            <span className="text-[10px] text-muted-foreground">Clique para analisar no topo</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {portfolioCards.map((shopping) => (
              <ShoppingCard
                key={shopping.id}
                shopping={shopping}
                selected={shopping.code === selectedCode}
                onSelect={selectShopping}
              />
            ))}
          </div>
        </section>

        <section className="panel p-4 xl:col-span-3">
          <div className="mb-2">
            <h2 className="text-sm font-semibold">Mapa / Distribuição</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Portfólio monitorado</p>
          </div>
          <BrazilMap items={portfolioCards} />
        </section>

        <section className="panel p-4 xl:col-span-3">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Oportunidades / Insights</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Prioridades derivadas dos dados disponíveis</p>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function display(value: number | null, digits = 1) {
  return value === null ? "—" : formatNumber(value, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function formatChartTime(value: string, period: HistoryPeriod) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (period === "24h") return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (period === "7d") return date.toLocaleDateString("pt-BR", { weekday: "short", hour: "2-digit" });
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function makePortfolioInsights(items: LiveShoppingSummary[]): Insight[] {
  const offline = items.filter((item) => {
    const collected = item.latest?.collectedAt;
    return !collected || Date.now() - Date.parse(collected) > 15 * 60 * 1000;
  });
  const balanceWarnings = items.filter((item) => item.latest?.kpis?.balanco_status === "warning");
  const highAux = items.filter((item) => (n(item.latest?.kpis?.auxiliares_pct_kw_cag) ?? 0) > 25);
  const mixed = items.filter((item) => item.registry.chillersAbsorption > 0);

  const result: Insight[] = [];
  if (offline.length) {
    result.push({
      id: "offline",
      type: "alerta",
      icon: "warning",
      title: `${offline.length} shopping(s) com dados desatualizados`,
      subtitle: "Verifique comunicação e última coleta.",
    });
  }
  if (balanceWarnings.length) {
    result.push({
      id: "balance",
      type: "alerta",
      icon: "warning",
      title: `Balanço elétrico em atenção em ${balanceWarnings.length} shopping(s)`,
      subtitle: "Há diferença relevante entre CAG medida e cargas conhecidas.",
    });
  }
  if (highAux.length) {
    result.push({
      id: "aux",
      type: "oportunidade",
      icon: "settings",
      title: `Periféricos acima de 25% em ${highAux.length} shopping(s)`,
      subtitle: "Priorize análise de bombas, torres e cargas auxiliares.",
    });
  }
  if (mixed.length) {
    result.push({
      id: "mixed",
      type: "destaque",
      icon: "trend",
      title: `${mixed.length} CAG(s) com chillers de absorção`,
      subtitle: "Comparações de COP global ficam indisponíveis sem energia térmica de entrada.",
    });
  }
  if (!result.length) {
    result.push({
      id: "normal",
      type: "destaque",
      icon: "trend",
      title: "Portfólio operando sem desvios prioritários",
      subtitle: "Nenhum alerta derivado dos dados disponíveis no momento.",
    });
  }
  return result.slice(0, 3);
}
