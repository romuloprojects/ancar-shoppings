import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Fan, Gauge, Settings, ShieldCheck, Thermometer, Zap } from "lucide-react";
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type { HistoryPeriod, ShoppingApiResponse } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage, SectionPanel, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNumber } from "@/utils/format";
import { asNumber, buildCurrentAlerts, mapLiveShoppingToLegacy } from "@/services/liveDashboardService";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/shoppings/$shoppingId")({
  head: ({ params }) => ({ meta: [{ title: `${params.shoppingId.toUpperCase()} — Detalhe do Shopping` }] }),
  component: ShoppingDetailPage,
});

function ShoppingDetailPage() {
  const { shoppingId } = Route.useParams();
  const { tick } = useDashboardRuntime();
  const [period, setPeriod] = useState<HistoryPeriod>("24h");
  const [data, setData] = useState<ShoppingApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true; setLoading(true);
    dashboardService.getShoppingById(shoppingId, period).then((result) => { if (alive) { setData(result); setError(result ? null : "Shopping não encontrado."); } }).catch((e) => { if (alive) setError(e instanceof Error ? e.message : "Falha ao carregar dados."); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [shoppingId, period, tick]);

  if (loading && !data) return <LoadingBlock h={760}/>;
  if (!data?.shopping) return <EmptyState title="Shopping indisponível" description={error ?? "Não foi possível consultar esta unidade."}/>;

  const raw = data.shopping;
  const shopping = mapLiveShoppingToLegacy(raw);
  const k = raw.latest?.kpis ?? {};
  const alerts = buildCurrentAlerts([raw]);
  const equipments = Object.entries(k.equipamentos ?? {}).map(([key, eq]) => ({ key, ...eq }));
  const settings = raw.settings;

  return <InternalPage>
    <PageHeader eyebrow={`${shopping.code} · ${shopping.city}/${shopping.stateCode}`} title={shopping.name} subtitle={raw.latest?.collectedAt ? `Última coleta: ${formatDateTime(raw.latest.collectedAt)}` : "Sem coleta disponível"} icon={Activity}
      right={<Button variant="outline" size="sm" asChild><Link to="/shoppings"><ArrowLeft className="mr-1.5 h-3.5 w-3.5"/>Voltar</Link></Button>}/>

    {error && <div className="rounded-lg border border-[var(--accent-yellow)]/25 bg-[var(--accent-yellow)]/8 px-3 py-2 text-xs text-[var(--accent-yellow)]">{error}</div>}

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
      <StatCard label="Potência CAG" value={num(shopping.powerKW,1)} unit="kW" icon={Zap} accent="cyan"/>
      <StatCard label={`Energia · ${period}`} value={num(data.summary.energyKwh,1)} unit="kWh" icon={Activity} accent="blue"/>
      <StatCard label="Produção térmica" value={num(shopping.thermalLoadTR,1)} unit="TR" icon={Activity} accent="purple"/>
      <StatCard label="kW/TR" value={num(shopping.efficiencyKWTR,3)} unit="kW/TR" icon={Gauge} accent="green"/>
      <StatCard label="Periféricos" value={num(shopping.peripheralKW,1)} unit="kW" icon={Fan} accent="yellow"/>
      <StatCard label="Temperatura externa" value={num(shopping.temperatureC,1)} unit="°C" icon={Thermometer} accent="orange"/>
    </div>

    <Tabs defaultValue="comportamento" className="space-y-4">
      <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger value="comportamento">Comportamento</TabsTrigger><TabsTrigger value="equipamentos">Equipamentos</TabsTrigger><TabsTrigger value="qualidade">Qualidade</TabsTrigger><TabsTrigger value="configuracao">Configuração</TabsTrigger>
      </TabsList>

      <TabsContent value="comportamento" className="m-0 space-y-4">
        <SectionPanel title="Comportamento da CAG" subtitle="Potência, produção térmica e kW/TR no período selecionado" icon={Activity}
          right={<div className="segmented-control">{(["24h","7d","30d"] as HistoryPeriod[]).map((p)=><button type="button" key={p} data-active={period===p} onClick={()=>setPeriod(p)}>{p}</button>)}</div>}>
          <div className="h-[360px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data.history}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="timestamp" tickFormatter={timeLabel} minTickGap={30} tick={{fontSize:10,fill:"var(--muted-foreground)"}}/><YAxis yAxisId="left" tick={{fontSize:10,fill:"var(--muted-foreground)"}}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:10,fill:"var(--muted-foreground)"}}/><Tooltip contentStyle={chartTooltipStyle} labelFormatter={(v)=>formatDateTime(String(v))}/><Line yAxisId="left" type="monotone" dataKey="kwCag" name="Potência CAG (kW)" stroke="var(--accent-cyan)" dot={false} strokeWidth={2}/><Line yAxisId="left" type="monotone" dataKey="trTotal" name="Produção (TR)" stroke="var(--accent-blue)" dot={false} strokeWidth={1.8}/><Line yAxisId="right" type="monotone" dataKey="kwTr" name="kW/TR" stroke="var(--accent-green)" dot={false} strokeWidth={1.8}/></ComposedChart></ResponsiveContainer></div>
        </SectionPanel>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Energia no período" value={num(data.summary.energyKwh,1)} unit="kWh"/><StatCard label="Frio acumulado" value={num(data.summary.thermalTrh,1)} unit="TRh" accent="blue"/><StatCard label="Média kW/TR" value={num(data.summary.avgKwTr,3)} unit="kW/TR" accent="green"/><StatCard label="Pico de potência" value={num(data.summary.maxKw,1)} unit="kW" accent="yellow"/></div>
      </TabsContent>

      <TabsContent value="equipamentos" className="m-0">
        <SectionPanel title="Chillers" subtitle="Estado e desempenho das máquinas com dados disponíveis" icon={Activity}>
          {equipments.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{equipments.map((eq)=><div key={eq.key} className="rounded-xl border border-border/55 bg-muted/15 p-4"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold">{labelEquipment(eq.key)}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{eq.status===true?"Em operação":eq.status===false?"Desligado":"Status indisponível"}</div></div><StatusPill label={eq.status===true?"Ligado":eq.status===false?"Desligado":"Sem status"} tone={eq.status===true?"positive":"neutral"}/></div><div className="mt-4 grid grid-cols-2 gap-3"><Mini label="Potência" value={num(asNumber(eq.kw),1)} unit="kW"/><Mini label="Produção" value={num(asNumber(eq.tr),1)} unit="TR"/><Mini label="kW/TR" value={num(asNumber(eq.kw_tr),3)} unit="kW/TR"/><Mini label="COP" value={num(asNumber(eq.cop),2)} unit=""/></div></div>)}</div> : <EmptyState title="Sem equipamentos disponíveis" description="O cadastro de equipamentos não retornou chillers para esta unidade."/>}
        </SectionPanel>
      </TabsContent>

      <TabsContent value="qualidade" className="m-0 space-y-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Pontos válidos" value={`${raw.latest?.health?.pointsOk ?? 0} / ${raw.latest?.health?.pointsTotal ?? raw.registry.pointsTotal}`} icon={ShieldCheck} accent="green"/><StatCard label="Cobertura" value={num(shopping.dataQualityPct,0)} unit="%" icon={ShieldCheck} accent="blue"/><StatCard label="Desvio de balanço" value={num(shopping.balanceDeviationPct,2)} unit="%" icon={Gauge} accent="yellow"/><StatCard label="Periféricos / CAG" value={num(shopping.peripheralsPct,1)} unit="%" icon={Fan} accent="purple"/></div>
        <SectionPanel title="Alertas atuais" subtitle="Condições calculadas a partir dos limites configurados" icon={AlertTriangle}>{alerts.length ? <div className="space-y-2">{alerts.map((a)=><div key={a.id} className="rounded-lg border border-border/55 bg-muted/15 p-3"><div className="flex items-center justify-between gap-3"><div className="text-sm font-medium">{a.title}</div><StatusPill label={a.severity==="critico"?"Crítico":"Atenção"} tone={a.severity==="critico"?"danger":"warning"}/></div><p className="mt-1 text-xs text-muted-foreground">{a.description}</p></div>)}</div> : <div className="text-sm text-muted-foreground">Nenhum alerta operacional ativo.</div>}</SectionPanel>
      </TabsContent>

      <TabsContent value="configuracao" className="m-0">
        <SectionPanel title="Parâmetros vigentes" subtitle="Os valores são definidos na tela Configurações e aplicados pelo n8n" icon={Settings} right={<Button size="sm" variant="outline" asChild><Link to="/configuracoes">Editar configurações</Link></Button>}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><ConfigItem label="Baseline" value={settings.baselineKwTr} unit="kW/TR"/><ConfigItem label="Meta" value={settings.targetKwTr} unit="kW/TR"/><ConfigItem label="Fator de emissão" value={settings.emissionFactorKgCo2Kwh} unit="kgCO₂/kWh"/><ConfigItem label="Limite de balanço" value={settings.balanceWarningPct} unit="%"/></div>
        </SectionPanel>
      </TabsContent>
    </Tabs>
  </InternalPage>;
}

function num(v:number|null|undefined,d=1){return v===null||v===undefined?"—":formatNumber(v,{maximumFractionDigits:d});}
function timeLabel(v:string){const d=new Date(v);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("pt-BR",{day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(d);}
function labelEquipment(k:string){return k.replace(/_/g," ").replace(/\b\w/g,(c)=>c.toUpperCase());}
function Mini({label,value,unit}:{label:string;value:string;unit:string}){return <div><div className="text-[10px] uppercase tracking-[.1em] text-muted-foreground">{label}</div><div className="mt-1 metric-value text-lg">{value} <span className="text-[10px] text-muted-foreground">{unit}</span></div></div>}
function ConfigItem({label,value,unit}:{label:string;value:number|null;unit:string}){return <div className="rounded-xl border border-border/55 bg-muted/15 p-4"><div className="text-[10px] uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="mt-2 text-lg font-semibold">{value===null?"Não configurado":`${formatNumber(value,{maximumFractionDigits:4})} ${unit}`}</div></div>}
