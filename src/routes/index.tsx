import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Fan, Gauge, Thermometer, Zap } from "lucide-react";
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
import { liveDashboardService, asNumber, mapLiveShoppingToLegacy } from "@/services/liveDashboardService";
import type {
  HistoryPeriod,
  Insight,
  LiveShoppingSummary,
  PortfolioApiResponse,
  RankingItem,
  Shopping,
  ShoppingApiResponse,
  ShoppingStatus,
} from "@/types";
import { KpiCard } from "@/components/KpiCard";
import { ShoppingCard } from "@/components/ShoppingCard";
import { BrazilMap } from "@/components/BrazilMap";
import { LoadingBlock } from "@/components/ui-helpers";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { StatusDot } from "@/components/StatusBadge";
import { InsightCard } from "@/components/InsightCard";
import { PortfolioHealthCard } from "@/components/PortfolioHealthCard";
import { DataUnavailable } from "@/components/DataUnavailable";
import { formatBRL2, formatKwTr, formatNumber } from "@/utils/format";
import { absoluteChange, getComparisonLabel, percentageChange, targetDeviationPct } from "@/utils/comparison";
import { buildChartHistory, formatHistoryTick, formatHistoryTooltip, getHistoryTimeDomain, historyTickCount } from "@/utils/history";

type RankingMetric = "power" | "production" | "efficiency" | "quality";


const OVERVIEW_LAYOUT_V45_CSS = `
@media (min-width: 1024px) {
  .app-inset {
    height: 100svh !important;
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  .dashboard-main {
    height: auto !important;
    min-height: calc(100svh - var(--ancar-topbar-h)) !important;
    overflow: visible !important;
  }
  .overview-dashboard {
    display: grid !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    grid-template-rows: 92px 310px auto !important;
    gap: .75rem !important;
    overflow: visible !important;
  }
  .overview-dashboard > * + * { margin-top: 0 !important; }
  .overview-kpis { height: 92px !important; grid-template-columns: repeat(6, minmax(0, 1fr)) !important; gap: .65rem !important; }
  .overview-kpis > article { height: 92px !important; }
  .overview-primary-grid {
    height: 310px !important;
    min-height: 310px !important;
    grid-template-columns: minmax(0, 5.4fr) minmax(260px, 2.6fr) minmax(280px, 3fr) !important;
    gap: .75rem !important;
  }

  /* Regra definitiva da faixa inferior: 6 ShoppingCards em 3x2. */
  .overview-portfolio-grid {
    display: grid !important;
    height: 408px !important;
    min-height: 408px !important;
    max-height: 408px !important;
    grid-template-columns: minmax(0, 5fr) minmax(0, 3fr) minmax(0, 2fr) minmax(0, 2fr) !important;
    grid-template-rows: 408px !important;
    grid-auto-rows: 408px !important;
    align-items: stretch !important;
    gap: .75rem !important;
    overflow: visible !important;
  }
  .overview-portfolio-panel,
  .overview-map-panel,
  .overview-insights-panel,
  .overview-health-panel {
    grid-column: auto !important;
    height: 408px !important;
    min-height: 408px !important;
    max-height: 408px !important;
    align-self: stretch !important;
  }

  .overview-portfolio-panel {
    display: flex !important;
    flex-direction: column !important;
    padding: 1rem !important;
    overflow: hidden !important;
  }
  .overview-portfolio-cards {
    display: grid !important;
    flex: 0 0 auto !important;
    width: 100% !important;
    height: 302px !important;
    min-height: 302px !important;
    max-height: 302px !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    grid-template-rows: repeat(2, 146px) !important;
    grid-auto-rows: 146px !important;
    gap: 10px !important;
    align-content: start !important;
    overflow: hidden !important;
    padding-right: 0 !important;
  }
  .overview-portfolio-cards > a,
  .overview-portfolio-panel .group.relative.flex {
    height: 146px !important;
    min-height: 146px !important;
    max-height: 146px !important;
  }
  .overview-portfolio-panel > .mt-3.flex {
    flex: 0 0 auto !important;
    margin-top: .75rem !important;
  }

  .overview-map-panel {
    display: flex !important;
    flex-direction: column !important;
    padding: 1rem !important;
    overflow: hidden !important;
  }
  .overview-map-panel > h2 {
    flex: 0 0 auto !important;
    margin-bottom: .5rem !important;
  }
  .overview-map-panel .portfolio-map-root {
    display: flex !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    flex-direction: column !important;
  }
  .overview-map-panel .portfolio-map-svg {
    display: block !important;
    flex: 1 1 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: none !important;
  }
  .overview-map-panel .portfolio-map-legend {
    display: flex !important;
    flex: 0 0 24px !important;
    min-height: 24px !important;
    align-items: center !important;
    gap: .8rem !important;
    margin-top: .35rem !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    white-space: nowrap !important;
  }

  .overview-insights-panel {
    padding: 1rem !important;
    overflow: hidden !important;
  }
  .overview-insights-list {
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  .overview-health-panel { overflow: hidden !important; }
  .portfolio-health-card {
    height: 408px !important;
    min-height: 408px !important;
    max-height: 408px !important;
    padding: 1rem !important;
  }
  .portfolio-health-card .portfolio-health-gauge {
    width: 82px !important;
    height: 82px !important;
  }
  .portfolio-health-card .portfolio-health-gauge .metric-value { font-size: 11px !important; }
  .portfolio-health-card .portfolio-health-gauge-wrap { margin-top: .65rem !important; }
  .portfolio-health-card .portfolio-health-rows { margin-top: .9rem !important; }
  .portfolio-health-card .portfolio-health-footer { display: grid !important; }
}
`;

const rankingOptions: Record<
  RankingMetric,
  { label: string; unit: string; lowerIsBetter: boolean }
> = {
  power: { label: "Potência CAG", unit: "kW", lowerIsBetter: false },
  production: { label: "Produção térmica", unit: "TR", lowerIsBetter: false },
  efficiency: { label: "Eficiência Energética", unit: "kW/TR", lowerIsBetter: true },
  quality: { label: "Qualidade dos dados", unit: "%", lowerIsBetter: false },
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
      { title: "Visão Geral | ANCAR CAG" },
      {
        name: "description",
        content: "Visão geral operacional da CAG e do portfólio ANCAR.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const {
    tick,
    selectedShoppingCode,
    setSelectedShoppingCode,
    historyPeriod,
    setHistoryPeriod,
  } = useDashboardRuntime();
  const [portfolioPage, setPortfolioPage] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioApiResponse | null>(null);
  const [shoppingData, setShoppingData] = useState<ShoppingApiResponse | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyQueryRef = useRef<string>("");

  useEffect(() => {
    let alive = true;
    // Polling silencioso: depois da carga inicial, mantém o conteúdo atual na tela.
    liveDashboardService
      .getPortfolio()
      .then((result) => {
        if (!alive) return;
        setPortfolio(result);
        setError(null);
        if (result.shoppings.length && !result.shoppings.some((s) => s.code === selectedShoppingCode)) {
          setSelectedShoppingCode(result.shoppings[0].code);
        }
      })
      .catch((err: unknown) => {
        if (alive && !portfolio) setError(err instanceof Error ? err.message : "Falha ao consultar a API ANCAR.");
      })
      .finally(() => {
        if (alive) setLoadingPortfolio(false);
      });

    return () => {
      alive = false;
    };
  }, [tick, selectedShoppingCode, setSelectedShoppingCode]);

  useEffect(() => {
    if (!selectedShoppingCode) return;
    let alive = true;
    const queryKey = `${selectedShoppingCode}:${historyPeriod}`;
    const queryChanged = historyQueryRef.current !== queryKey;
    historyQueryRef.current = queryKey;

    // Só mostra loading quando o usuário realmente troca shopping/período e ainda
    // não existe um conjunto compatível em memória. O tick de 3 minutos é 100% background.
    if (queryChanged && !(shoppingData?.shopping?.code === selectedShoppingCode && shoppingData.period === historyPeriod)) {
      setLoadingHistory(true);
    }

    liveDashboardService
      .getShopping(selectedShoppingCode, historyPeriod)
      .then((result) => {
        if (!alive) return;
        setShoppingData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive && !(shoppingData?.shopping?.code === selectedShoppingCode && shoppingData.period === historyPeriod)) {
          setError(err instanceof Error ? err.message : "Falha ao consultar o histórico ANCAR.");
        }
      })
      .finally(() => {
        if (alive && queryChanged) setLoadingHistory(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedShoppingCode, historyPeriod, tick]);

  const selectedShopping = useMemo(
    () => portfolio?.shoppings.find((item) => item.code === selectedShoppingCode) ?? null,
    [portfolio, selectedShoppingCode],
  );

  const portfolioCards = useMemo<Shopping[]>(
    () => (portfolio?.shoppings ?? []).map(mapLiveShoppingToLegacy),
    [portfolio],
  );


  const insights = useMemo(
    () => makePortfolioInsights(portfolio?.shoppings ?? []),
    [portfolio],
  );

  const currentHistoryQueryKey = `${selectedShoppingCode}:${historyPeriod}`;
  const hasMatchingHistoryData =
    shoppingData?.shopping?.code === selectedShoppingCode && shoppingData.period === historyPeriod;
  // Cobre também o primeiro render após troca de shopping/período, antes do useEffect ligar o loading.
  const historyTransitionPending = !hasMatchingHistoryData && historyQueryRef.current !== currentHistoryQueryKey;

  const chartHistory = useMemo(
    () => buildChartHistory(hasMatchingHistoryData ? shoppingData?.history ?? [] : [], historyPeriod),
    [shoppingData, hasMatchingHistoryData, historyPeriod],
  );
  const historyDomain = useMemo(
    () => getHistoryTimeDomain(
      historyPeriod,
      shoppingData?.shopping?.code === selectedShoppingCode && shoppingData.period === historyPeriod ? shoppingData.generatedAt : null,
    ),
    [historyPeriod, shoppingData, selectedShoppingCode],
  );

  if (loadingPortfolio && !portfolio) {
    return <LoadingBlock h={880} />;
  }

  if (!portfolio || !selectedShopping) {
    return (
      <section className="panel p-8 text-center">
        <h1 className="text-lg font-semibold">Visão Geral indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "Nenhum shopping ativo foi retornado pela API ANCAR."}
        </p>
      </section>
    );
  }

  const history = hasMatchingHistoryData ? shoppingData?.history ?? [] : [];
  const kpis = selectedShopping.latest?.kpis ?? {};
  const isMixed =
    kpis.modelo_energetico === "mixed_absorption_electric" ||
    selectedShopping.registry.chillersAbsorption > 0;
  const kwCag = asNumber(kpis.kw_cag);
  const trTotal = asNumber(kpis.tr_total);
  const kwTr = asNumber(kpis.kw_tr_eletrico_cag ?? kpis.kw_tr_cag);
  const activeChillers = asNumber(kpis.chillers_ativos ?? kpis.chillers_ativos_por_status);
  const kwAux = asNumber(kpis.kw_auxiliares);
  const temperature = asNumber(kpis.temperatura_externa_c);
  const totalChillers = selectedShopping.registry.chillersTotal;

  const comparison =
    shoppingData && shoppingData.shopping.code === selectedShoppingCode && shoppingData.period === historyPeriod
      ? shoppingData.comparison ?? null
      : null;
  const comparisonLabel = getComparisonLabel(historyPeriod);
  const kwComparison = percentageChange(comparison?.current.avgKw, comparison?.previous.avgKw);
  const trComparison = percentageChange(comparison?.current.avgTr, comparison?.previous.avgTr);
  const kwTrComparison = percentageChange(comparison?.current.avgKwTr, comparison?.previous.avgKwTr);
  const activeComparison = percentageChange(comparison?.current.avgActiveChillers, comparison?.previous.avgActiveChillers);
  const auxComparison = percentageChange(comparison?.current.avgAuxKw, comparison?.previous.avgAuxKw);
  const temperatureComparison = absoluteChange(comparison?.current.avgTemperatureC, comparison?.previous.avgTemperatureC);
  const settings = selectedShopping.settings;
  const targetCag = asNumber(settings?.targetKwTr);
  const targetChiller = asNumber(settings?.targetChillerKwTr);
  const chillerKwTr = asNumber(kpis.kw_tr_chillers);
  const cagTargetDeviation = targetDeviationPct(kwTr, targetCag);
  const chillerTargetDeviation = targetDeviationPct(chillerKwTr, targetChiller);
  const economicSummary = hasMatchingHistoryData ? shoppingData?.summary ?? null : null;
  const periodLabel = historyPeriod === "24h" ? "últimas 24h" : historyPeriod === "7d" ? "últimos 7 dias" : "últimos 30 dias";


  const portfolioPageSize = 6;
  const portfolioPageCount = Math.max(1, Math.ceil(portfolioCards.length / portfolioPageSize));
  const safePortfolioPage = Math.min(portfolioPage, portfolioPageCount - 1);
  const portfolioItems = portfolioCards.slice(
    safePortfolioPage * portfolioPageSize,
    safePortfolioPage * portfolioPageSize + portfolioPageSize,
  );

  const portfolioHealth = makePortfolioHealth(portfolio.shoppings);

  return (
    <><style data-ancar-overview-layout="5.2">{OVERVIEW_LAYOUT_V45_CSS}</style><div className="overview-dashboard space-y-4" data-ancar-ui-version="5.7.0">
      {error && (
        <div className="overview-error rounded-lg border border-[color-mix(in_oklab,var(--accent-yellow)_38%,transparent)] bg-[color-mix(in_oklab,var(--accent-yellow)_8%,transparent)] px-3 py-2 text-xs text-[var(--accent-yellow)]">
          {error}
        </div>
      )}

      <div className="overview-kpis grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={Zap}
          label="Potência CAG"
          value={display(kwCag, 1)}
          unit="kW"
          accent="cyan"
          comparisonValue={kwComparison}
          comparisonLabel={comparisonLabel}
        />
        <KpiCard
          icon={Activity}
          label="Produção Térmica"
          value={display(trTotal, 1)}
          unit="TR"
          accent="blue"
          comparisonValue={trComparison}
          comparisonLabel={comparisonLabel}
        />
        <KpiCard
          icon={Gauge}
          label={isMixed ? "Intensidade Elétrica" : "Eficiência da CAG"}
          value={formatKwTr(kwTr)}
          unit="kW/TR"
          accent="green"
          comparisonValue={kwTrComparison}
          comparisonLabel={comparisonLabel}
          comparisonTone="lower-better"
        />
        <KpiCard
          icon={Activity}
          label="Chillers Ativos"
          value={activeChillers === null ? "—" : `${activeChillers} / ${totalChillers}`}
          accent="purple"
          comparisonValue={activeComparison}
          comparisonLabel={comparisonLabel}
        />
        <KpiCard
          icon={Fan}
          label="Periféricos"
          value={display(kwAux, 1)}
          unit="kW"
          accent="yellow"
          comparisonValue={auxComparison}
          comparisonLabel={comparisonLabel}
          comparisonTone="lower-better"
        />
        <KpiCard
          icon={Thermometer}
          label="Temperatura Externa"
          value={display(temperature, 1)}
          unit="°C"
          accent="orange"
          comparisonValue={temperatureComparison}
          comparisonLabel={comparisonLabel}
          comparisonUnit="°C"
        />
      </div>

      <div className="overview-primary-grid grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,5.4fr)_minmax(260px,2.6fr)_minmax(280px,3fr)]">
        <section className="panel overview-chart-panel min-h-0 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Comportamento da CAG <span className="ml-1.5 text-xs font-normal text-muted-foreground">({selectedShopping.code})</span></h2>
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--accent-cyan)]"/>Potência CAG (kW)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--accent-blue)]"/>Produção (TR)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--accent-green)]"/>{isMixed ? "Intensidade" : "Eficiência"} (kW/TR)</span>
                {temperature !== null && <span className="flex items-center gap-1.5"><Thermometer className="h-3 w-3 text-[var(--accent-yellow)]"/>{display(temperature,1)} °C</span>}
              </div>
            </div>
            <select value={historyPeriod} onChange={(event)=>setHistoryPeriod(event.target.value as HistoryPeriod)} aria-label="Período do gráfico" className="h-8 rounded-md border border-border/60 bg-card/60 px-2.5 text-xs text-foreground outline-none focus:border-primary/60">
              <option value="24h">24h</option><option value="7d">7 dias</option><option value="30d">30 dias</option>
            </select>
          </div>
          <div className="overview-chart h-[244px] min-h-0 2xl:h-[258px]">
            {(loadingHistory || historyTransitionPending) && history.length === 0 ? <LoadingBlock h={244}/> : history.length === 0 ? <div className="grid h-full place-items-center"><DataUnavailable label="Histórico ainda não disponível para este período"/></div> : (
              <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartHistory} margin={{top:8,right:0,bottom:0,left:-12}}>
                <defs><linearGradient id="cagPowerArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.34}/><stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="chartTimestamp" type="number" scale="time" domain={historyDomain} tickCount={historyTickCount(historyPeriod)} tickFormatter={(value)=>formatHistoryTick(Number(value),historyPeriod)} stroke="var(--muted-foreground)" tick={{fontSize:10}} minTickGap={18} tickLine={false} axisLine={{stroke:"var(--border)"}} allowDataOverflow/>
                <YAxis yAxisId="eff" stroke="var(--muted-foreground)" tick={{fontSize:10}} tickLine={false} axisLine={false} width={38}/>
                <YAxis yAxisId="load" orientation="right" stroke="var(--muted-foreground)" tick={{fontSize:10}} tickLine={false} axisLine={false} width={48}/>
                <Tooltip labelFormatter={(value)=>formatHistoryTooltip(typeof value==="number"?value:Number(value))} formatter={(value,name)=>{const label=String(name);const numeric=typeof value==="number"?value:Number(value);if(label.includes("kW/TR"))return [formatKwTr(numeric),label];return [formatNumber(numeric,{maximumFractionDigits:1}),label]}} contentStyle={{background:"var(--popover)",color:"var(--popover-foreground)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,boxShadow:"var(--panel-glow)"}} labelStyle={{color:"var(--foreground)"}}/>
                <Area isAnimationActive={false} yAxisId="load" type="linear" dataKey="kwCag" name="Potência CAG (kW)" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#cagPowerArea)" activeDot={{r:4}} connectNulls={false}/>
                <Line isAnimationActive={false} yAxisId="load" type="linear" dataKey="trTotal" name="Produção (TR)" stroke="var(--accent-blue)" strokeWidth={2} dot={false} activeDot={{r:4}} connectNulls={false}/>
                <Line isAnimationActive={false} yAxisId="eff" type="linear" dataKey="kwTr" name={`${isMixed?"Intensidade":"Eficiência"} (kW/TR)`} stroke="var(--accent-green)" strokeWidth={2} dot={{r:2.2,fill:"var(--accent-green)",strokeWidth:0}} activeDot={{r:4}} connectNulls={false}/>
              </ComposedChart></ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel overview-target-panel min-h-0 p-4">
          <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Desempenho vs Metas</h2><Link to="/configuracoes" className="text-[10px] font-semibold text-primary hover:underline">Editar metas</Link></div>
          <div className="space-y-5">
            <GoalMeter label="Meta CAG (Eficiência)" target={targetCag} current={kwTr} deviation={cagTargetDeviation}/>
            <GoalMeter label="Meta Chillers (Eficiência)" target={targetChiller} current={chillerKwTr} deviation={chillerTargetDeviation}/>
          </div>
        </section>

        <section className="panel overview-economic-panel min-h-0 p-4">
          <div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="text-sm font-semibold">Resumo Econômico</h2><p className="mt-0.5 text-[10px] text-muted-foreground">{periodLabel}</p></div><Link to="/esg" className="text-[10px] font-semibold text-primary hover:underline">Ver análise completa</Link></div>
          <div className="grid grid-cols-2 gap-2">
            <EconomicMini label="Custo energético" value={formatBRL2(economicSummary?.energyCostBrl)}/>
            <EconomicMini label="Custo acima da meta" value={formatBRL2(economicSummary?.costAboveTargetBrl)} tone="warning"/>
            <EconomicMini label="Energia consumida" value={economicSummary?.energyKwh == null ? "—" : `${formatNumber(economicSummary.energyKwh/1000,{maximumFractionDigits:2})} MWh`}/>
            <EconomicMini label="R$ / TRh" value={economicSummary?.costPerTrhBrl == null ? "—" : formatBRL2(economicSummary.costPerTrhBrl)}/>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/45 pt-2 text-[9px] text-muted-foreground"><span>Tarifa configurada</span><span className="font-medium text-foreground">{settings.energyTariffBrlMwh == null ? "Não configurada" : `${formatBRL2(settings.energyTariffBrlMwh).replace(",00","")} / MWh`}</span></div>
        </section>
      </div>

      <div className="overview-portfolio-grid grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel overview-portfolio-panel min-h-0 p-4 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Visão do Portfólio
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({portfolioCards.length} Shoppings)
              </span>
            </h2>
            <Link to="/shoppings" className="text-xs text-[var(--accent-cyan)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="overview-portfolio-cards grid min-h-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((shopping) => (
              <ShoppingCard key={shopping.id} shopping={shopping} />
            ))}
          </div>
          {portfolioPageCount > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
              <span>
                Exibindo {safePortfolioPage * portfolioPageSize + 1}–
                {Math.min((safePortfolioPage + 1) * portfolioPageSize, portfolioCards.length)} de{" "}
                {portfolioCards.length}
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
          )}
        </section>

        <section className="panel overview-map-panel min-h-0 p-4 xl:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">Mapa / Distribuição</h2>
          <BrazilMap items={portfolioCards} />
        </section>

        <section className="panel overview-insights-panel flex h-full min-h-0 flex-col p-4 xl:col-span-2">
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
          <div className="overview-insights-list min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        <div className="overview-health-panel min-h-0 xl:col-span-2">
          <PortfolioHealthCard metrics={portfolioHealth} />
        </div>
      </div>
    </div></>
  );
}

function GoalMeter({label,target,current,deviation}:{label:string;target:number|null;current:number|null;deviation:number|null}){
  const configured=target!==null&&target>0;
  const tone=deviation===null?"text-muted-foreground":deviation<=0?"text-[var(--accent-green)]":"text-[var(--accent-red)]";
  const progress=!configured||current===null?0:Math.max(5,Math.min(100,(current/Math.max(target*1.5,0.01))*100));
  return <div><div className="text-[10px] font-semibold">{label}</div><div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]"><div><span className="text-muted-foreground">Meta</span><div className="metric-value mt-0.5">{formatKwTr(target)} <span className="text-[8px] font-normal text-muted-foreground">kW/TR</span></div></div><div><span className="text-muted-foreground">Atual</span><div className="metric-value mt-0.5">{formatKwTr(current)} <span className="text-[8px] font-normal text-muted-foreground">kW/TR</span></div></div></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/55"><span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent-green),var(--accent-yellow),var(--accent-red))]" style={{width:`${progress}%`}}/></div><div className={`mt-1.5 text-[10px] font-semibold ${tone}`}>{!configured?"Meta não configurada":deviation===null?"Sem dado atual":Math.abs(deviation)<0.05?"Na meta":`${Math.abs(deviation).toFixed(1).replace(".",",")}% ${deviation<0?"abaixo":"acima"} da meta`}</div></div>
}
function EconomicMini({label,value,tone="normal"}:{label:string;value:string;tone?:"normal"|"warning"}){return <div className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"><div className="text-[9px] text-muted-foreground">{label}</div><div className={`metric-value mt-1 text-base ${tone==="warning"?"text-[var(--accent-yellow)]":""}`}>{value}</div></div>}

function makeLiveRanking(items: LiveShoppingSummary[], metric: RankingMetric): RankingItem[] {
  const option = rankingOptions[metric];
  const evaluated = items.map((item) => {
    const kpis = item.latest?.kpis ?? {};
    const total = asNumber(item.latest?.health?.pointsTotal) ?? item.registry.pointsTotal;
    const ok = asNumber(item.latest?.health?.pointsOk) ?? 0;
    const quality = total > 0 ? (ok / total) * 100 : null;
    const kwCag = asNumber(kpis.kw_cag);
    const trTotal = asNumber(kpis.tr_total);

    let value: number | null = null;
    if (metric === "power") value = kwCag;
    if (metric === "production") value = trTotal;
    if (metric === "efficiency") {
      value = asNumber(kpis.kw_tr_eletrico_cag ?? kpis.kw_tr_cag);
      if (value === null && kwCag !== null && trTotal !== null && trTotal > 0) value = kwCag / trTotal;
    }
    if (metric === "quality") value = quality;

    const status = mapLiveShoppingToLegacy(item).status;
    if (status === "offline") value = null;

    const currentKwTr = asNumber(kpis.kw_tr_eletrico_cag ?? kpis.kw_tr_cag);
    const targetKwTr = asNumber(item.settings?.targetKwTr);
    const deviationFromTarget = targetDeviationPct(currentKwTr, targetKwTr);

    return {
      item,
      value,
      status,
      targetKwTr,
      targetDeviationPct: deviationFromTarget,
      reason:
        status === "offline"
          ? "Dados desatualizados"
          : value === null
            ? "Sem dado disponível"
            : metric === "efficiency" && deviationFromTarget === null
              ? "Sem meta configurada · fallback por kW/TR"
              : undefined,
    };
  });

  const valid = evaluated
    .filter((row): row is (typeof evaluated)[number] & { value: number } => row.value !== null)
    .sort((a, b) => {
      if (metric === "efficiency") {
        const aHasTarget = a.targetDeviationPct !== null;
        const bHasTarget = b.targetDeviationPct !== null;

        // Unidades com meta configurada são comparadas pelo desvio percentual relativo à meta.
        // Unidades sem meta ficam depois e usam kW/TR absoluto apenas como fallback.
        if (aHasTarget && bHasTarget) {
          const deviationDiff = (a.targetDeviationPct as number) - (b.targetDeviationPct as number);
          if (Math.abs(deviationDiff) > 1e-9) return deviationDiff;
          return a.value - b.value;
        }
        if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1;
        return a.value - b.value;
      }

      return option.lowerIsBetter ? a.value - b.value : b.value - a.value;
    });
  const positions = new Map(valid.map((row, index) => [row.item.id, index + 1]));

  return evaluated
    .sort((a, b) => {
      const pa = positions.get(a.item.id) ?? Number.POSITIVE_INFINITY;
      const pb = positions.get(b.item.id) ?? Number.POSITIVE_INFINITY;
      if (pa !== pb) return pa - pb;
      return a.item.name.localeCompare(b.item.name, "pt-BR");
    })
    .map(({ item, value, status, reason, targetKwTr, targetDeviationPct }) => ({
      position: positions.get(item.id) ?? null,
      shoppingId: item.id || item.code.toLowerCase(),
      code: item.code,
      name: item.name,
      value,
      unit: option.unit,
      status,
      comparable: true,
      targetKwTr,
      targetDeviationPct,
      reason,
    }));
}

function makePortfolioInsights(items: LiveShoppingSummary[]): Insight[] {
  const result: Insight[] = [];
  const stale = items.filter((item) => isStale(item));
  if (stale.length) result.push({ id:"stale", type:"alerta", icon:"warning", title:`${stale.length} shopping(s) com comunicação degradada`, subtitle:"Verifique última coleta, retries e comunicação WebCTRL." });

  const opportunities = items.map((item)=>{
    const current=asNumber(item.latest?.kpis?.kw_tr_eletrico_cag ?? item.latest?.kpis?.kw_tr_cag);
    const target=asNumber(item.settings?.targetKwTr);
    const deviation=targetDeviationPct(current,target);
    const cost=asNumber(item.today?.costAboveTargetBrl);
    return {item,current,target,deviation,cost};
  }).filter((row)=>row.deviation!==null && row.deviation>0).sort((a,b)=>(b.cost??0)-(a.cost??0) || (b.deviation??0)-(a.deviation??0));
  if(opportunities[0]){const x=opportunities[0];result.push({id:`opp-${x.item.code}`,type:"oportunidade",icon:"settings",title:`Oportunidade CAG · ${x.item.code}`,subtitle:`Eficiência ${Math.abs(x.deviation!).toFixed(1).replace(".",",")}% acima da meta${x.cost!==null?` · custo acima da meta ${formatBRL2(x.cost)}`:""}.`});}

  const best = items.map((item)=>{const current=asNumber(item.latest?.kpis?.kw_tr_eletrico_cag ?? item.latest?.kpis?.kw_tr_cag);const target=asNumber(item.settings?.targetKwTr);return {item,deviation:targetDeviationPct(current,target)};}).filter((r)=>r.deviation!==null).sort((a,b)=>(a.deviation as number)-(b.deviation as number))[0];
  if(best?.deviation!==null && best && best.deviation<=0) result.push({id:`best-${best.item.code}`,type:"destaque",icon:"trend",title:`Boa performance · ${best.item.code}`,subtitle:`Eficiência ${Math.abs(best.deviation).toFixed(1).replace(".",",")}% abaixo da Meta CAG.`});

  const unconfigured=items.filter((item)=>item.settings?.targetKwTr===null || item.settings?.targetChillerKwTr===null || item.settings?.energyTariffBrlMwh===null);
  if(unconfigured.length) result.push({id:"settings",type:"oportunidade",icon:"settings",title:`${unconfigured.length} shopping(s) com parâmetros pendentes`,subtitle:"Configure Meta CAG, Meta Chillers e Tarifa para liberar todos os indicadores."});
  if(!result.length) result.push({id:"normal",type:"destaque",icon:"trend",title:"Portfólio sem oportunidades prioritárias",subtitle:"Nenhum desvio de meta ou falha relevante foi identificado agora."});
  return result.slice(0,4);
}

function makePortfolioHealth(items: LiveShoppingSummary[]) {
  let pointsOk = 0;
  let pointsTotal = 0;
  let online = 0;
  let stale = 0;

  for (const item of items) {
    const total = asNumber(item.latest?.health?.pointsTotal) ?? item.registry.pointsTotal ?? 0;
    const ok = asNumber(item.latest?.health?.pointsOk) ?? 0;
    pointsTotal += total;
    pointsOk += ok;
    if (isStale(item)) stale += 1;
    else online += 1;
  }

  return {
    qualityPct: pointsTotal > 0 ? (pointsOk / pointsTotal) * 100 : 0,
    pointsOk,
    pointsTotal,
    online,
    stale,
    totalShoppings: items.length,
  };
}

function isStale(item: LiveShoppingSummary) {
  const collectedAt = item.latest?.collectedAt;
  if (!collectedAt) return true;
  const timestamp = Date.parse(collectedAt);
  if (!Number.isFinite(timestamp)) return true;
  const staleMinutes = Math.max(10, (item.collectionIntervalMinutes ?? 3) * 3);
  return Date.now() - timestamp > staleMinutes * 60_000;
}

function isNumber(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function display(value: number | null, digits = 1) {
  return value === null
    ? "—"
    : formatNumber(value, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function getRankingPositionWidth(position: number | null, total: number) {
  if (position === null || total <= 0) return 0;
  if (total === 1) return 100;
  const normalized = 100 - ((position - 1) / Math.max(1, total - 1)) * 72;
  return Math.max(18, Math.min(100, normalized));
}

function getRankingWidth(value: number, min: number, max: number, lowerIsBetter: boolean) {
  if (max === min) return 100;
  const normalized = (value - min) / (max - min);
  const score = lowerIsBetter ? 1 - normalized : normalized;
  return 36 + score * 64;
}

function formatRankingValue(value: number | null, metric: RankingMetric) {
  if (value === null) return "—";
  if (metric === "quality") return `${formatNumber(value, { maximumFractionDigits: 0 })}%`;
  if (metric === "efficiency") return `${formatKwTr(value)} kW/TR`;
  return `${formatNumber(value, { maximumFractionDigits: 0 })} ${rankingOptions[metric].unit}`;
}
