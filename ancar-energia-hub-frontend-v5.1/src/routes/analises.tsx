import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BarChart3, Fan, Gauge, ShieldCheck, Thermometer, Zap } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { liveDashboardService } from "@/services/liveDashboardService";
import type {
  AnalysisMetric,
  HistoryPeriod,
  LiveShoppingSummary,
  ShoppingApiResponse,
} from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import {
  FilterBar,
  InternalPage,
  SectionPanel,
  StatCard,
  chartTooltipStyle,
} from "@/components/InternalPage";
import { formatKwTr, formatMetric } from "@/utils/format";
import { buildChartHistory, formatHistoryTick, formatHistoryTooltip, getHistoryTimeDomain, historyTickCount } from "@/utils/history";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/analises")({
  head: () => ({ meta: [{ title: "Análises" }] }),
  component: AnalyticsPage,
});

const METRICS: Record<AnalysisMetric, { label: string; unit: string; icon: typeof Zap }> = {
  kwCag: { label: "Potência CAG", unit: "kW", icon: Zap },
  energyKwh: { label: "Energia elétrica", unit: "kWh", icon: Activity },
  trTotal: { label: "Produção térmica", unit: "TR", icon: Activity },
  kwTr: { label: "Eficiência Energética", unit: "kW/TR", icon: Gauge },
  kwAux: { label: "Periféricos", unit: "kW", icon: Fan },
  temperatureC: { label: "Temperatura externa", unit: "°C", icon: Thermometer },
  dataQualityPct: { label: "Qualidade dos dados", unit: "%", icon: ShieldCheck },
  energyCostBrl: { label: "Custo energético", unit: "R$", icon: Activity },
  costAboveTargetBrl: { label: "Custo acima da meta", unit: "R$", icon: Activity },
  costPerTrhBrl: { label: "Custo específico", unit: "R$/TRh", icon: Gauge },
};

const SERIES_COLORS = [
  "var(--accent-cyan)",
  "var(--accent-blue)",
  "var(--accent-green)",
  "var(--accent-yellow)",
  "var(--accent-purple)",
  "var(--accent-orange)",
  "var(--accent-red)",
];

function AnalyticsPage() {
  const {
    tick,
    selectedShoppingCode,
    historyPeriod: period,
    setHistoryPeriod: setPeriod,
    comparisonShoppingCodes,
    setComparisonShoppingCodes,
    comparisonMetric,
    setComparisonMetric,
  } = useDashboardRuntime();
  const [portfolio, setPortfolio] = useState<LiveShoppingSummary[]>([]);
  const [selected, setSelected] = useState<string[]>(comparisonShoppingCodes);
  const [metric, setMetric] = useState<AnalysisMetric>(comparisonMetric);
  const [series, setSeries] = useState<ShoppingApiResponse[]>([]);
  const loadedQueryRef = useRef("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    liveDashboardService.getPortfolio().then((result) => {
      if (!alive) return;
      setPortfolio(result.shoppings);
      const validCodes = new Set(result.shoppings.map((shopping) => shopping.code));
      setSelected((current) => {
        const validCurrent = current.filter((code) => validCodes.has(code));
        if (validCurrent.length) return validCurrent;
        if (selectedShoppingCode && validCodes.has(selectedShoppingCode)) return [selectedShoppingCode];
        return result.shoppings[0] ? [result.shoppings[0].code] : [];
      });
    });
    return () => {
      alive = false;
    };
  }, [tick, selectedShoppingCode]);

  useEffect(() => {
    setComparisonShoppingCodes(selected);
  }, [selected, setComparisonShoppingCodes]);

  useEffect(() => {
    setComparisonMetric(metric);
  }, [metric, setComparisonMetric]);


  useEffect(() => {
    const queryKey = `${period}|${selected.join(",")}`;
    if (!selected.length) {
      setSeries([]);
      setLoading(false);
      loadedQueryRef.current = queryKey;
      return;
    }
    let alive = true;
    const queryChanged = loadedQueryRef.current !== queryKey;
    if (queryChanged) setLoading(true);
    Promise.all(
      selected.map(async (code) => ({
        code,
        result: await liveDashboardService.getShopping(code, period).catch(() => null),
      })),
    )
      .then((results) => {
        if (!alive) return;
        setSeries((current) => {
          const fresh = new Map(results.filter((item) => item.result).map((item) => [item.code, item.result as ShoppingApiResponse]));
          return selected
            .map((code) => fresh.get(code) ?? (!queryChanged ? current.find((item) => item.shopping?.code === code) : null) ?? null)
            .filter((item): item is ShoppingApiResponse => item !== null);
        });
        loadedQueryRef.current = queryKey;
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selected, period, tick]);

  const config = METRICS[metric];
  const summaryValues = useMemo(
    () =>
      series
        .map((shopping) =>
          metric === "energyKwh" ? shopping.summary.energyKwh
            : metric === "energyCostBrl" ? shopping.summary.energyCostBrl ?? null
            : metric === "costAboveTargetBrl" ? shopping.summary.costAboveTargetBrl ?? null
            : metric === "costPerTrhBrl" ? shopping.summary.costPerTrhBrl ?? null
            : average(shopping.history.map((history) => history[metric] as number | null)),
        )
        .filter((value): value is number => value !== null),
    [series, metric],
  );
  const avg = average(summaryValues);
  const max = summaryValues.length ? Math.max(...summaryValues) : null;
  const min = summaryValues.length ? Math.min(...summaryValues) : null;
  const chartData = useMemo(() => mergeSeries(series, metric, period), [series, metric, period]);
  const historyDomain = useMemo(() => {
    const generatedAt = series.map((item) => Date.parse(item.generatedAt)).filter(Number.isFinite);
    return getHistoryTimeDomain(period, generatedAt.length ? Math.max(...generatedAt) : null);
  }, [series, period]);

  const displayValue = (value: number | null | undefined) =>
    config.unit === "kW/TR" ? formatKwTr(value) : config.unit.startsWith("R$") && value != null ? new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL",maximumFractionDigits:2}).format(value) : formatMetric(value, config.unit, 1);

  return (
    <InternalPage className="compact-page compact-analysis-page">
      <PageHeader
        eyebrow="Histórico consolidado"
        title="Análises"
        subtitle="Compare eficiência, energia, custos, produção térmica, periféricos, temperatura e qualidade entre shoppings."
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Unidades selecionadas" value={selected.length} icon={BarChart3} accent="cyan" />
        <StatCard label="Média" value={displayValue(avg)} unit={config.unit} icon={config.icon} accent="green" />
        <StatCard label="Máximo" value={displayValue(max)} unit={config.unit} icon={Activity} accent="yellow" />
        <StatCard label="Mínimo" value={displayValue(min)} unit={config.unit} icon={Gauge} accent="blue" />
      </div>

      <FilterBar>
        <label className="flex w-full flex-col gap-1 text-[10px] uppercase tracking-[.12em] text-muted-foreground sm:w-auto sm:min-w-[180px]">
          Métrica
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as AnalysisMetric)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm normal-case tracking-normal text-foreground"
          >
            {Object.entries(METRICS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented-control w-full self-end sm:w-auto">
          {(["24h", "7d", "30d"] as HistoryPeriod[]).map((value) => (
            <button
              type="button"
              key={value}
              data-active={period === value}
              onClick={() => setPeriod(value)}
              className="flex-1 sm:flex-none"
            >
              {value}
            </button>
          ))}
        </div>

        <div className="analysis-unit-selector flex max-h-[76px] w-full flex-wrap items-end gap-2 overflow-y-auto pr-1 lg:ml-auto lg:w-auto lg:max-w-[54%]">
          {portfolio.map((shopping) => (
            <label
              key={shopping.code}
              className="flex min-w-[92px] flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-border/55 bg-background/45 px-2.5 py-2 text-xs sm:flex-none"
            >
              <input
                type="checkbox"
                checked={selected.includes(shopping.code)}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(shopping.code)
                      ? current.filter((code) => code !== shopping.code)
                      : [...current, shopping.code],
                  )
                }
              />
              {shopping.code}
            </label>
          ))}
        </div>
      </FilterBar>

      <div className="analysis-workspace-body min-h-0 flex-1">
        <SectionPanel
          title={`Comparação · ${config.label}`}
          subtitle={`Período: ${period} · ${series.length} unidade(s) com série disponível`}
          icon={config.icon}
          className="compact-fill-panel"
          contentClassName="compact-analysis-content"
        >
          {loading ? (
            <LoadingBlock h={390} />
          ) : series.length === 0 ? (
            <EmptyState title="Sem séries disponíveis" description="Selecione ao menos uma unidade com histórico disponível." />
          ) : (
            <>
              <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
                {series.map((shopping, index) => (
                  <span key={shopping.shopping?.code} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
                    {shopping.shopping?.code} · {shopping.shopping?.name}
                  </span>
                ))}
              </div>
              <div className="analysis-main-chart h-[230px] min-w-0 sm:h-[260px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="chartTimestamp" type="number" scale="time" domain={historyDomain} tickCount={historyTickCount(period)} tickFormatter={(value) => formatHistoryTick(Number(value), period)} minTickGap={24} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} allowDataOverflow />
                    <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} width={52} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(value) => formatHistoryTooltip(typeof value === "number" ? value : Number(value))} formatter={(value, name) => [displayValue(typeof value === "number" ? value : Number(value)), `${String(name)} (${config.unit})`]} />
                    {series.map((shopping, index) => {
                      const code = shopping.shopping?.code ?? `S${index + 1}`;
                      return <Line isAnimationActive={false} key={code} type="linear" dataKey={code} name={code} stroke={SERIES_COLORS[index % SERIES_COLORS.length]} dot={false} strokeWidth={2} connectNulls={false} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="analysis-kpi-strip mt-2 grid grid-cols-2 gap-1.5 lg:grid-cols-5">
                <AnalysisMini label="Média" value={displayValue(avg)} unit={config.unit}/>
                <AnalysisMini label="Máximo" value={displayValue(max)} unit={config.unit}/>
                <AnalysisMini label="Mínimo" value={displayValue(min)} unit={config.unit}/>
                <AnalysisMini label="Séries" value={String(series.length)} unit="unid."/>
                <AnalysisMini label="Período" value={period} unit=""/>
              </div>
            </>
          )}
        </SectionPanel>

        <aside className="analysis-side-stack min-h-0">
          <section className="panel min-h-0 overflow-hidden p-3">
            <div className="text-xs font-semibold">Shoppings comparados</div>
            <div className="analysis-side-list mt-2 min-h-0 overflow-y-auto pr-1">
              {series.map((shopping,index)=>{
                const value = metric === "energyKwh" ? shopping.summary.energyKwh : metric === "energyCostBrl" ? shopping.summary.energyCostBrl ?? null : metric === "costAboveTargetBrl" ? shopping.summary.costAboveTargetBrl ?? null : metric === "costPerTrhBrl" ? shopping.summary.costPerTrhBrl ?? null : average(shopping.history.map((history)=>history[metric] as number|null));
                return <div key={shopping.shopping?.code} className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/35 py-2 text-[10px]"><span className="h-2 w-2 rounded-full" style={{background:SERIES_COLORS[index%SERIES_COLORS.length]}}/><span className="truncate">{shopping.shopping?.code} · {shopping.shopping?.name}</span><span className="metric-value">{displayValue(value)}</span></div>
              })}
            </div>
          </section>
          <section className="panel min-h-0 overflow-hidden p-3">
            <div className="text-xs font-semibold">Leituras rápidas</div>
            <div className="mt-2 space-y-2 text-[10px]">
              <div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><span className="text-muted-foreground">Métrica ativa</span><div className="mt-1 font-semibold">{config.label} ({config.unit})</div></div>
              <div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><span className="text-muted-foreground">Comparação</span><div className="mt-1 font-semibold">{series.length} unidade(s) com série disponível</div></div>
            </div>
          </section>
        </aside>
      </div>
    </InternalPage>
  );
}

function AnalysisMini({label,value,unit}:{label:string;value:string;unit:string}){return <div className="rounded-lg border border-border/45 bg-muted/10 px-2.5 py-2"><div className="text-[9px] uppercase tracking-[.1em] text-muted-foreground">{label}</div><div className="mt-1 metric-value text-sm">{value} {unit&&<span className="text-[9px] font-normal text-muted-foreground">{unit}</span>}</div></div>}

function mergeSeries(series: ShoppingApiResponse[], metric: AnalysisMetric, period: HistoryPeriod) {
  const rows = new Map<number, Record<string, string | number | null>>();
  for (const shopping of series) {
    const code = shopping.shopping?.code;
    if (!code) continue;
    for (const point of buildChartHistory(shopping.history, period)) {
      const row = rows.get(point.chartTimestamp) ?? {
        timestamp: point.timestamp,
        chartTimestamp: point.chartTimestamp,
      };
      row[code] = point[metric] as number | null;
      rows.set(point.chartTimestamp, row);
    }
  }
  return Array.from(rows.values()).sort(
    (a, b) => Number(a.chartTimestamp) - Number(b.chartTimestamp),
  );
}

function average(values: (number | null | undefined)[]) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}
