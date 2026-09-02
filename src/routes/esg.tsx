import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Leaf, Recycle, ShieldCheck, Zap } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { liveDashboardService, asNumber } from "@/services/liveDashboardService";
import type { LiveShoppingSummary, ShoppingApiResponse } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage, SectionPanel, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKwTr, formatNumber } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { buildChartHistory, formatHistoryTick, formatHistoryTooltip, getHistoryTimeDomain, historyTickCount } from "@/utils/history";

export const Route = createFileRoute("/esg")({ head: () => ({ meta: [{ title: "Energia e Emissões" }] }), component: ESGPage });

function ESGPage(){
 const {tick,selectedShoppingCode,historyPeriod}=useDashboardRuntime();
 const [items,setItems]=useState<LiveShoppingSummary[]>([]); const [detail,setDetail]=useState<ShoppingApiResponse|null>(null); const [loading,setLoading]=useState(true); const [loadingDetail,setLoadingDetail]=useState(true);
 useEffect(()=>{let alive=true;liveDashboardService.getPortfolio().then(p=>{if(alive)setItems(p.shoppings)}).catch(()=>{}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[tick]);
 useEffect(()=>{if(!selectedShoppingCode)return;let alive=true;setLoadingDetail(true);liveDashboardService.getShopping(selectedShoppingCode,historyPeriod).then(r=>{if(alive)setDetail(r)}).catch(()=>{}).finally(()=>{if(alive)setLoadingDetail(false)});return()=>{alive=false}},[selectedShoppingCode,historyPeriod,tick]);
 const totals=useMemo(()=>{const energy=items.map(s=>asNumber(s.today?.energyKwh)).filter((v):v is number=>v!==null);const saved=items.map(s=>asNumber(s.today?.savedKwh)).filter((v):v is number=>v!==null);const avoided=items.map(s=>asNumber(s.today?.avoidedKgCo2)).filter((v):v is number=>v!==null);return {energy:energy.length?energy.reduce((a,b)=>a+b,0):null,saved:saved.length?saved.reduce((a,b)=>a+b,0):null,avoided:avoided.length?avoided.reduce((a,b)=>a+b,0):null,configured:items.filter(s=>s.settings?.baselineKwTr!==null&&s.settings?.emissionFactorKgCo2Kwh!==null).length}},[items]);
 const selected=items.find(s=>s.code===selectedShoppingCode)??null;
 const currentDetail=detail?.shopping?.code===selectedShoppingCode&&detail.period===historyPeriod?detail:null;
 const chartHistory=useMemo(()=>buildChartHistory(currentDetail?.history??[],historyPeriod),[currentDetail,historyPeriod]);
 const historyDomain=useMemo(()=>getHistoryTimeDomain(historyPeriod,currentDetail?.generatedAt),[historyPeriod,currentDetail?.generatedAt]);
 return <InternalPage className="compact-page compact-esg-page"><PageHeader eyebrow="Indicadores disponíveis" title="Energia e Emissões" subtitle="Energia, baseline e emissões somente quando os parâmetros necessários foram configurados por shopping." icon={Leaf}/>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Energia hoje" value={totals.energy===null?"—":formatNumber(totals.energy,{maximumFractionDigits:1})} unit="kWh" icon={Zap} accent="cyan"/><StatCard label="Energia evitada estimada" value={totals.saved===null?"—":formatNumber(totals.saved,{maximumFractionDigits:1})} unit="kWh" icon={Activity} accent="green"/><StatCard label="Emissões evitadas estimadas" value={totals.avoided===null?"—":formatNumber(totals.avoided,{maximumFractionDigits:2})} unit="kgCO₂" icon={Recycle} accent="green"/><StatCard label="Unidades parametrizadas" value={`${totals.configured} / ${items.length}`} icon={ShieldCheck} accent="blue"/></div>
 <div className="energy-workspace-body min-h-0 flex-1">
   <SectionPanel title={`Energia real e estimativas · ${selected?.code??"—"}`} subtitle={`Histórico do shopping selecionado · ${historyPeriod}`} icon={Activity} className="compact-fill-panel">
     {loadingDetail&&!currentDetail?<LoadingBlock h={300}/>:!currentDetail?.history?.length?<EmptyState title="Sem histórico disponível" description="O gráfico será exibido quando houver telemetria histórica."/>:<>
       <div className="energy-main-chart min-h-0 flex-1"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartHistory} margin={{top:8,right:8,bottom:2,left:-8}}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="chartTimestamp" type="number" scale="time" domain={historyDomain} tickCount={historyTickCount(historyPeriod)} tickFormatter={v=>formatHistoryTick(Number(v),historyPeriod)} minTickGap={24} tick={{fontSize:9,fill:"var(--muted-foreground)"}} allowDataOverflow/><YAxis tick={{fontSize:9,fill:"var(--muted-foreground)"}} width={52}/><Tooltip contentStyle={chartTooltipStyle} labelFormatter={v=>formatHistoryTooltip(typeof v==="number"?v:Number(v))} formatter={(value,name)=>[formatNumber(Number(value),{maximumFractionDigits:1}),String(name)]}/><Line type="linear" dataKey="energyKwh" name="Energia (kWh)" stroke="var(--accent-blue)" dot={false} strokeWidth={2} connectNulls={false}/><Line type="linear" dataKey="savedKwh" name="Energia evitada (kWh)" stroke="var(--accent-green)" dot={false} strokeWidth={2} connectNulls={false}/></LineChart></ResponsiveContainer></div>
       <div className="energy-baseline-strip mt-2 grid grid-cols-2 gap-1.5 lg:grid-cols-4"><Mini label="Baseline" value={formatKwTr(selected?.settings?.baselineKwTr)} unit="kW/TR"/><Mini label="Meta" value={formatKwTr(selected?.settings?.targetKwTr)} unit="kW/TR"/><Mini label="Energia hoje" value={num(selected?.today?.energyKwh,1)} unit="kWh"/><Mini label="Fator emissão" value={num(selected?.settings?.emissionFactorKgCo2Kwh,4)} unit="kgCO₂/kWh"/></div>
     </>}
   </SectionPanel>
   <aside className="energy-side-stack min-h-0">
     <SectionPanel title="Por shopping" subtitle="Resumo do portfólio" icon={Leaf} className="compact-fill-panel" contentClassName="compact-scroll-region">{loading?<LoadingBlock h={240}/>:items.length===0?<EmptyState title="Sem dados disponíveis"/>:<div className="data-table-shell"><Table><TableHeader><TableRow><TableHead>Shopping</TableHead><TableHead className="text-right">Energia</TableHead><TableHead className="text-right">Emissões</TableHead><TableHead>Config.</TableHead></TableRow></TableHeader><TableBody>{items.map(s=>{const configured=s.settings?.baselineKwTr!==null&&s.settings?.emissionFactorKgCo2Kwh!==null;return <TableRow key={s.code}><TableCell className="font-medium">{s.code}</TableCell><TableCell className="metric-value text-right">{num(s.today?.energyKwh,1)} kWh</TableCell><TableCell className="metric-value text-right">{configured?`${num(s.today?.avoidedKgCo2,2)} kgCO₂`:"—"}</TableCell><TableCell><StatusPill label={configured?"OK":"Pendente"} tone={configured?"positive":"warning"}/></TableCell></TableRow>})}</TableBody></Table></div>}</SectionPanel>
     <section className="panel p-3"><div className="text-xs font-semibold">Metodologia</div><div className="mt-2 space-y-2 text-[10px] text-muted-foreground"><p><b className="text-foreground">Energia evitada:</b> produção térmica × diferença entre baseline e intensidade medida.</p><p><b className="text-foreground">Emissões evitadas:</b> energia evitada × fator de emissão configurado para o shopping.</p><div className="rounded-lg border border-[var(--accent-yellow)]/25 bg-[var(--accent-yellow)]/8 p-2">Sem baseline ou fator de emissão, a estimativa permanece indisponível.</div></div></section>
   </aside>
 </div>
 </InternalPage>
}
function num(v:unknown,d=1){const n=asNumber(v);return n===null?"—":formatNumber(n,{maximumFractionDigits:d})}
function Mini({label,value,unit}:{label:string;value:string;unit:string}){return <div className="rounded-lg border border-border/45 bg-muted/10 px-2.5 py-2"><div className="text-[9px] uppercase tracking-[.1em] text-muted-foreground">{label}</div><div className="mt-1 metric-value text-sm">{value} <span className="text-[9px] font-normal text-muted-foreground">{unit}</span></div></div>}
