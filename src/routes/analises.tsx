import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/analises")({
  head: () => ({ meta: [{ title: "Análises" }] }),
  component: AnalyticsPage,
});

const METRICS: Record<AnalysisMetric, { label: string; unit: string; icon: typeof Zap }> = {
  kwCag: { label: "Potência CAG", unit: "kW", icon: Zap },
  energyKwh: { label: "Energia elétrica", unit: "kWh", icon: Activity },
  trTotal: { label: "Produção térmica", unit: "TR", icon: Activity },
  kwTr: { label: "Intensidade elétrica", unit: "kW/TR", icon: Gauge },
  kwAux: { label: "Periféricos", unit: "kW", icon: Fan },
  temperatureC: { label: "Temperatura externa", unit: "°C", icon: Thermometer },
  dataQualityPct: { label: "Qualidade dos dados", unit: "%", icon: ShieldCheck },
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
    historyPeriod,
    setHistoryPeriod,
    comparisonShoppingCodes,
    setComparisonShoppingCodes,
    comparisonMetric,
    setComparisonMetric,
  } = useDashboardRuntime();
  const [portfolio, setPortfolio] = useState<LiveShoppingSummary[]>([]);
  const [selected, setSelected] = useState<string[]>(comparisonShoppingCodes);
  const [metric, setMetric] = useState<AnalysisMetric>(comparisonMetric);
  const [period, setPeriod] = useState<HistoryPeriod>(historyPeriod);
  const [series, setSeries] = useState<ShoppingApiResponse[]>([]);
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
    setHistoryPeriod(period);
  }, [period, setHistoryPeriod]);

  useEffect(() => {
    if (!selected.length) {
      setSeries([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all(
      selected.map((code) => liveDashboardService.getShopping(code, period).catch(() => null)),
    )
      .then((results) => {
        if (alive) setSeries(results.filter((item): item is ShoppingApiResponse => !!item));
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
          metric === "energyKwh"
            ? shopping.summary.energyKwh
            : average(shopping.history.map((history) => history[metric] as number | null)),
        )
        .filter((value): value is number => value !== null),
    [series, metric],
  );
  const avg = average(summaryValues);
  const max = summaryValues.length ? Math.max(...summaryValues) : null;
  const min = summaryValues.length ? Math.min(...summaryValues) : null;
  const chartData = useMemo(() => mergeSeries(series, metric), [series, metric]);

  const displayValue = (value: number | null | undefined) =>
    config.unit === "kW/TR" ? formatKwTr(value) : formatMetric(value, config.unit, 1);

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Histórico consolidado"
        title="Análises"
        subtitle="Compare potência, energia, produção térmica, intensidade elétrica, periféricos, temperatura externa e qualidade dos dados."
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

        <div className="flex w-full flex-wrap items-end gap-2 lg:ml-auto lg:w-auto">
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

      <SectionPanel
        title={`Comparação · ${config.label}`}
        subtitle={`Período: ${period} · ${series.length} unidade(s) com série disponível`}
        icon={config.icon}
      >
        {loading ? (
          <LoadingBlock h={390} />
        ) : series.length === 0 ? (
          <EmptyState title="Sem séries disponíveis" description="Selecione ao menos uma unidade com histórico disponível." />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {series.map((shopping, index) => (
                <span key={shopping.shopping?.code} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }}
                  />
                  {shopping.shopping?.code} · {shopping.shopping?.name}
                </span>
              ))}
            </div>
            <div className="h-[280px] min-w-0 sm:h-[340px] lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => labelTime(String(value), period)}
                    minTickGap={28}
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} width={52} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={(value) => new Date(String(value)).toLocaleString("pt-BR")}
                    formatter={(value, name) => [
                      displayValue(typeof value === "number" ? value : Number(value)),
                      `${String(name)} (${config.unit})`,
                    ]}
                  />
                  {series.map((shopping, index) => {
                    const code = shopping.shopping?.code ?? `S${index + 1}`;
                    return (
                      <Line
                        key={code}
                        type="monotone"
                        dataKey={code}
                        name={code}
                        stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                        dot={false}
                        strokeWidth={2}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {series.map((shopping, index) => {
                const value =
                  metric === "energyKwh"
                    ? shopping.summary.energyKwh
                    : average(shopping.history.map((history) => history[metric] as number | null));
                return (
                  <div
                    key={shopping.shopping?.code}
                    className="rounded-xl border border-border/55 bg-muted/10 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {shopping.shopping?.code} · {shopping.shopping?.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{config.label}</div>
                      </div>
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }}
                      />
                    </div>
                    <div className="mt-3 metric-value text-xl">
                      {displayValue(value)} <span className="text-[10px] text-muted-foreground">{config.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionPanel>
    </InternalPage>
  );
}

function mergeSeries(series: ShoppingApiResponse[], metric: AnalysisMetric) {
  const rows = new Map<string, Record<string, string | number | null>>();
  for (const shopping of series) {
    const code = shopping.shopping?.code;
    if (!code) continue;
    for (const point of shopping.history) {
      const row = rows.get(point.timestamp) ?? { timestamp: point.timestamp };
      row[code] = point[metric] as number | null;
      rows.set(point.timestamp, row);
    }
  }
  return Array.from(rows.values()).sort(
    (a, b) => Date.parse(String(a.timestamp)) - Date.parse(String(b.timestamp)),
  );
}

function average(values: (number | null | undefined)[]) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function labelTime(value: string, period: HistoryPeriod) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (period === "24h") {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}
