import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bolt, Building2, Gauge, Leaf, Thermometer, Wind } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type { ShoppingDetail } from "@/types";
import { EmptyState, LoadingBlock } from "@/components/ui-helpers";
import { chartTooltipStyle, InternalPage, StatusPill } from "@/components/InternalPage";
import { StatusBadge } from "@/components/StatusBadge";
import { DataUnavailable } from "@/components/DataUnavailable";
import {
  formatBRL,
  formatNumber,
  formatRelative,
  severityLabel,
  alertStatusLabel,
} from "@/utils/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/shoppings/$shoppingId")({
  head: ({ params }) => ({
    meta: [{ title: `${params.shoppingId.toUpperCase()} — Detalhe do Shopping` }],
  }),
  component: ShoppingDetailPage,
});

function ShoppingDetailPage() {
  const { shoppingId } = Route.useParams();
  const [d, setD] = useState<ShoppingDetail | null | undefined>(undefined);
  useEffect(() => {
    setD(undefined);
    dashboardService.getShoppingById(shoppingId).then(setD);
  }, [shoppingId]);

  if (d === undefined) return <LoadingBlock h={500} />;
  if (d === null)
    return (
      <InternalPage>
        <EmptyState
          title="Shopping não encontrado"
          description="A unidade informada não existe ou não está disponível no portfólio atual."
          icon={Building2}
          action={
            <Link
              to="/shoppings"
              className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium hover:bg-muted/50"
            >
              Voltar aos shoppings
            </Link>
          }
        />
      </InternalPage>
    );

  return (
    <InternalPage>
      <Link
        to="/shoppings"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos shoppings
      </Link>

      <div className="panel overflow-hidden p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-border/50 bg-gradient-to-br from-[var(--accent-blue)]/25 to-transparent">
              <Building2 className="h-6 w-6 text-[var(--accent-blue)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold md:text-2xl">{d.name}</h1>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold">
                  {d.code}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {d.city} / {d.state} · Atualizado {formatRelative(d.lastUpdate)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={d.status} />
            <StatusPill
              label={`${d.dataAvailability.coveragePct}% cobertura`}
              tone={d.dataAvailability.coveragePct >= 90 ? "positive" : "warning"}
            />
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span>
            Qualidade:{" "}
            <strong className="font-medium text-foreground capitalize">{d.dataQuality}</strong>
          </span>
          <span>
            Chillers:{" "}
            <strong className="font-medium text-foreground">
              {d.dataAvailability.chillers ? "disponível" : "indisponível"}
            </strong>
          </span>
          <span>
            Periféricos:{" "}
            <strong className="font-medium text-foreground">
              {d.dataAvailability.perifericos ? "disponível" : "indisponível"}
            </strong>
          </span>
          <span>
            Temperaturas:{" "}
            <strong className="font-medium text-foreground">
              {d.dataAvailability.temperaturas ? "disponível" : "indisponível"}
            </strong>
          </span>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <MetricTile
          label="Potência"
          value={`${formatNumber(d.powerKW / 1000, { maximumFractionDigits: 2 })}`}
          unit="MW"
        />
        <MetricTile
          label="Consumo dia"
          value={formatNumber(d.consumptionMWh, { maximumFractionDigits: 1 })}
          unit="MWh"
        />
        <MetricTile
          label="Consumo mês"
          value={d.monthlyConsumptionMWh ? formatNumber(d.monthlyConsumptionMWh) : null}
          unit="MWh"
        />
        <MetricTile
          label="Carga térmica"
          value={d.thermalLoadTR ? formatNumber(d.thermalLoadTR) : null}
          unit="TR"
        />
        <MetricTile
          label="Eficiência"
          value={formatNumber(d.efficiencyKWTR, { maximumFractionDigits: 2 })}
          unit="kW/TR"
        />
        <MetricTile label="COP" value={d.copValue?.toFixed(2) ?? null} />
        <MetricTile label="Delta T" value={d.deltaT?.toFixed(1) ?? null} unit="°C" />
        <MetricTile
          label="Vazão"
          value={d.dataAvailability.vazao && d.vazaoLs ? formatNumber(d.vazaoLs) : null}
          unit="L/s"
        />
        <MetricTile label="Emissões" value={d.emissionsTons?.toFixed(2) ?? null} unit="t CO₂" />
        <MetricTile label="Economia" value={d.savingsBRL ? formatBRL(d.savingsBRL) : null} />
        <MetricTile label="ESG Score" value={String(d.esgScore)} />
        <MetricTile label="Qualidade dos dados" value={`${d.dataAvailability.coveragePct}%`} />
      </div>

      {/* Séries temporais */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Consumo e Eficiência</h3>
        </div>
        <Tabs defaultValue="24h">
          <TabsList>
            <TabsTrigger value="24h">24 horas</TabsTrigger>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
          </TabsList>
          <TabsContent value="24h">
            <EnergyChart data={d.dailyConsumption} />
          </TabsContent>
          <TabsContent value="7d">
            <EnergyChart data={d.weeklyConsumption} />
          </TabsContent>
          <TabsContent value="30d">
            <EnergyChart data={d.monthlyConsumption} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chillers, periféricos, temperaturas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PowerBars
          title="Potência de Chillers"
          data={d.chillerPower}
          color="var(--accent-cyan)"
          icon={<Bolt className="h-4 w-4 text-[var(--accent-cyan)]" />}
        />
        <PowerBars
          title="Potência de Periféricos"
          data={d.peripheralPower}
          color="var(--accent-purple)"
          icon={<Wind className="h-4 w-4 text-[var(--accent-purple)]" />}
          unavailable={!d.dataAvailability.perifericos}
        />
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-[var(--accent-yellow)]" />{" "}
            <h3 className="text-sm font-semibold">Temperaturas</h3>
          </div>
          <div className="space-y-2">
            {d.temperatures.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{t.name}</span>
                {t.value !== null ? (
                  <span className="metric-value">
                    {t.value.toFixed(1)} {t.unit}
                  </span>
                ) : (
                  <DataUnavailable />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipamentos + Alertas + Insights */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Equipamentos</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Potência</TableHead>
                  <TableHead className="text-right">Eficiência</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.equipments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{e.type}</TableCell>
                    <TableCell className="text-right metric-value">{e.powerKW} kW</TableCell>
                    <TableCell className="text-right metric-value">
                      {e.efficiencyKWTR ? e.efficiencyKWTR.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize text-muted-foreground">{e.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="mb-3 text-sm font-semibold">Alertas recentes</h3>
            <div className="space-y-2">
              {d.alerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-md border border-border/40 bg-muted/20 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.title}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${a.severity === "critico" ? "bg-[var(--accent-red)]/15 text-[var(--accent-red)]" : a.severity === "atencao" ? "bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)]" : "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]"}`}
                    >
                      {severityLabel(a.severity)}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {a.equipment} · {alertStatusLabel(a.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <h3 className="mb-3 text-sm font-semibold">Oportunidades</h3>
            <div className="space-y-2">
              {d.insights.slice(0, 3).map((i) => (
                <div
                  key={i.id}
                  className="rounded-md border border-border/40 bg-muted/20 p-2.5 text-xs"
                >
                  <div className="font-medium">{i.title}</div>
                  <div className="text-muted-foreground">{i.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InternalPage>
  );
}

function MetricTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | null;
  unit?: string;
}) {
  return (
    <div className="panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {value === null ? (
        <div className="mt-1.5">
          <DataUnavailable />
        </div>
      ) : (
        <div className="mt-1 flex items-baseline gap-1">
          <span className="metric-value text-lg">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      )}
    </div>
  );
}

function EnergyChart({ data }: { data: { time: string; consumo: number; eficiencia: number }[] }) {
  return (
    <div className="h-64 pt-3">
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="detCons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="oklch(0.35 0.03 260 / 30%)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="time" stroke="oklch(0.6 0.02 250)" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="l" stroke="oklch(0.6 0.02 250)" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="r"
            orientation="right"
            stroke="oklch(0.6 0.02 250)"
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            yAxisId="r"
            type="monotone"
            dataKey="consumo"
            name="Consumo"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            fill="url(#detCons)"
          />
          <Line
            yAxisId="l"
            type="monotone"
            dataKey="eficiencia"
            name="Eficiência"
            stroke="var(--accent-green)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PowerBars({
  title,
  data,
  color,
  icon,
  unavailable,
}: {
  title: string;
  data: { name: string; kw: number }[];
  color: string;
  icon: React.ReactNode;
  unavailable?: boolean;
}) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {unavailable ? (
        <DataUnavailable />
      ) : (
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12 }}>
              <CartesianGrid
                stroke="oklch(0.35 0.03 260 / 25%)"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis type="number" stroke="oklch(0.6 0.02 250)" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="oklch(0.6 0.02 250)"
                width={90}
                tick={{ fontSize: 11 }}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="kw" fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
