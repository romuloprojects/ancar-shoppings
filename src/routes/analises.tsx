import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  GitCompareArrows,
  LineChart as LineChartIcon,
  MousePointerClick,
  Sigma,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import {
  chartTooltipStyle,
  FilterBar,
  InternalPage,
  SectionPanel,
  StatCard,
} from "@/components/InternalPage";
import { formatNumber } from "@/utils/format";

export const Route = createFileRoute("/analises")({
  head: () => ({ meta: [{ title: "Análises" }] }),
  component: AnalisesPage,
});

const PALETTE = [
  "var(--accent-cyan)",
  "var(--accent-green)",
  "var(--accent-blue)",
  "var(--accent-yellow)",
  "var(--accent-purple)",
  "var(--accent-orange)",
];

function AnalisesPage() {
  const [shoppings, setShoppings] = useState<Shopping[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [metric, setMetric] = useState<"consumo" | "eficiencia">("consumo");
  const [period, setPeriod] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<
    { id: string; code: string; series: { time: string; consumo: number; eficiencia: number }[] }[]
  >([]);

  useEffect(() => {
    let alive = true;
    dashboardService.getShoppings().then((list) => {
      if (!alive) return;
      setShoppings(list);
      setSelected(list.slice(0, 4).map((shopping) => shopping.id));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (selected.length === 0) {
      setSeries([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    dashboardService.getAnalytics({ shoppingIds: selected, metric }).then((result) => {
      if (!alive) return;
      setSeries(result);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [selected, metric, period]);

  const combined = useMemo(() => {
    if (series.length === 0) return [];
    const times = series[0].series.map((point) => point.time);
    return times.map((time, index) => {
      const row: Record<string, number | string> = { time };
      series.forEach((item) => {
        row[item.code] = item.series[index][metric];
      });
      return row;
    });
  }, [series, metric]);

  const selectedShoppings = useMemo(
    () => shoppings.filter((shopping) => selected.includes(shopping.id)),
    [shoppings, selected],
  );

  const averageMetric = useMemo(() => {
    if (!selectedShoppings.length) return 0;
    const values = selectedShoppings.map((shopping) =>
      metric === "consumo" ? shopping.consumptionMWh : shopping.efficiencyKWTR,
    );
    return values.reduce((total, value) => total + value, 0) / values.length;
  }, [selectedShoppings, metric]);

  const scatterData = shoppings
    .filter((shopping) => shopping.thermalLoadTR)
    .map((shopping) => ({
      x: shopping.thermalLoadTR ?? 0,
      y: shopping.efficiencyKWTR,
      z: shopping.powerKW,
      name: shopping.code,
    }));
  const deltaTData = shoppings
    .filter((shopping) => shopping.deltaT !== undefined)
    .map((shopping) => ({ code: shopping.code, deltaT: shopping.deltaT ?? 0 }));
  const heatmapDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const toggleShopping = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 6) return current;
      return [...current, id];
    });
  };

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Exploração comparativa"
        title="Análises"
        subtitle="Cruze tendências de consumo, eficiência, carga térmica e Delta T entre as unidades."
        icon={BarChart3}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Unidades selecionadas"
          value={selected.length}
          unit="de 6"
          icon={MousePointerClick}
          accent="cyan"
        />
        <StatCard
          label={metric === "consumo" ? "Consumo médio" : "Eficiência média"}
          value={formatNumber(averageMetric, { maximumFractionDigits: 2 })}
          unit={metric === "consumo" ? "MWh" : "kW/TR"}
          icon={Sigma}
          accent="green"
        />
        <StatCard
          label="Período analisado"
          value={period}
          detail="Seleção aplicada aos gráficos temporais"
          icon={LineChartIcon}
          accent="blue"
        />
        <StatCard
          label="Comparações ativas"
          value={series.length}
          detail="Séries sincronizadas"
          icon={GitCompareArrows}
          accent="purple"
        />
      </div>

      <FilterBar>
        <div className="flex min-w-0 flex-[1_1_600px] flex-wrap gap-1.5">
          {shoppings.map((shopping) => {
            const active = selected.includes(shopping.id);
            const disabled = !active && selected.length >= 6;
            return (
              <button
                key={shopping.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleShopping(shopping.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-[var(--accent-cyan)]/45 bg-[var(--accent-cyan)]/12 text-[var(--accent-cyan)]"
                    : "border-border/55 bg-background/35 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                }`}
              >
                {shopping.code}
              </button>
            );
          })}
        </div>
        <div className="segmented-control ml-auto">
          {(["consumo", "eficiencia"] as const).map((option) => (
            <button
              key={option}
              type="button"
              data-active={metric === option}
              onClick={() => setMetric(option)}
              className="capitalize"
            >
              {option}
            </button>
          ))}
        </div>
        <label className="flex min-w-[145px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Período
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
          >
            {["24h", "7 dias", "30 dias", "Personalizado"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </FilterBar>

      {selected.length === 0 ? (
        <EmptyState
          title="Selecione ao menos um shopping"
          description="Escolha até seis unidades para iniciar a comparação de desempenho."
          icon={GitCompareArrows}
        />
      ) : loading ? (
        <LoadingBlock h={680} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionPanel
              title={`Comparação de ${metric === "consumo" ? "consumo" : "eficiência"}`}
              subtitle={`${selected.length} séries no período ${period}`}
              icon={LineChartIcon}
              contentClassName="pt-3"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combined} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid
                      stroke="oklch(0.35 0.03 260 / 25%)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {series.map((item, index) => (
                      <Line
                        key={item.id}
                        type="monotone"
                        dataKey={item.code}
                        stroke={PALETTE[index % PALETTE.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel
              title="Consumo real por unidade"
              subtitle="Comparação simultânea das séries selecionadas"
              icon={BarChart3}
              contentClassName="pt-3"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combined} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid
                      stroke="oklch(0.35 0.03 260 / 25%)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {series.slice(0, 4).map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={item.code}
                        fill={PALETTE[index % PALETTE.length]}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel
              title="Eficiência vs. carga térmica"
              subtitle="Tamanho do ponto proporcional à potência instalada"
              icon={GitCompareArrows}
              contentClassName="pt-3"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -6, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(0.35 0.03 260 / 25%)" strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Carga TR"
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="kW/TR"
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[55, 240]} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={scatterData} fill="var(--accent-cyan)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel
              title="Delta T por shopping"
              subtitle="Referência comparativa do circuito de água gelada"
              icon={BarChart3}
              contentClassName="pt-3"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deltaTData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid
                      stroke="oklch(0.35 0.03 260 / 25%)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="code"
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="oklch(0.6 0.02 250)"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="deltaT" fill="var(--accent-yellow)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>
          </div>

          <SectionPanel
            title="Heatmap semanal de consumo"
            subtitle="Intensidade relativa das unidades selecionadas"
            icon={BarChart3}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground">Shopping</th>
                    {heatmapDays.map((day) => (
                      <th key={day} className="p-2 text-center font-medium text-muted-foreground">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedShoppings.map((shopping, shoppingIndex) => (
                    <tr key={shopping.id} className="border-t border-border/30">
                      <td className="p-2.5 font-medium">{shopping.code}</td>
                      {heatmapDays.map((_, dayIndex) => {
                        const value = (((shoppingIndex * 7 + dayIndex) * 13) % 20) + 4;
                        const intensity = Math.min(1, value / 22);
                        return (
                          <td key={dayIndex} className="p-1.5">
                            <div
                              className="rounded-md py-2 text-center font-medium text-foreground"
                              style={{
                                background: `color-mix(in oklab, var(--accent-blue) ${Math.round(intensity * 72)}%, transparent)`,
                              }}
                            >
                              {value}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPanel>
        </>
      )}
    </InternalPage>
  );
}
