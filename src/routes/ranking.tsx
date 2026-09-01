import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Gauge, Medal, ShieldCheck, Trophy, Zap } from "lucide-react";
import { dashboardService, type RankingMetric } from "@/services/dashboardService";
import type { RankingItem } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { FilterBar, InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { formatNumber } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/ranking")({ head: () => ({ meta: [{ title: "Ranking" }] }), component: RankingPage });

const METRICS: { key: RankingMetric; label: string; subtitle: string }[] = [
  { key: "eficiencia", label: "Eficiência", subtitle: "kW/TR para unidades com medição elétrica integral comparável" },
  { key: "energia", label: "Energia hoje", subtitle: "Energia elétrica acumulada desde 00:00" },
  { key: "potencia", label: "Potência", subtitle: "Potência instantânea da CAG" },
  { key: "producao", label: "Produção", subtitle: "Produção térmica instantânea" },
  { key: "perifericos", label: "Periféricos", subtitle: "Participação dos periféricos na potência da CAG" },
  { key: "qualidade", label: "Qualidade", subtitle: "Percentual de pontos válidos na última coleta" },
  { key: "balanco", label: "Balanço", subtitle: "Desvio entre potência total e soma das cargas medidas" },
];

function RankingPage(){
 const {tick}=useDashboardRuntime(); const [metric,setMetric]=useState<RankingMetric>("eficiencia"); const [rows,setRows]=useState<RankingItem[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;setLoading(true);dashboardService.getRanking(metric).then(r=>{if(alive)setRows(r)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[metric,tick]);
 const cfg=METRICS.find(m=>m.key===metric)!; const best=rows[0]; const average=useMemo(()=>rows.length?rows.reduce((a,r)=>a+r.value,0)/rows.length:null,[rows]);
 return <InternalPage><PageHeader eyebrow="Comparação do portfólio" title="Ranking" subtitle="Compare somente indicadores derivados das fontes reais disponíveis." icon={Trophy}/>
 <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Unidades comparadas" value={rows.length} icon={BarChart3} accent="cyan"/><StatCard label="Melhor resultado" value={best?formatNumber(best.value,{maximumFractionDigits:3}):"—"} unit={best?.unit} detail={best?best.code:"Sem dados"} icon={Medal} accent="green"/><StatCard label="Média" value={average===null?"—":formatNumber(average,{maximumFractionDigits:3})} unit={best?.unit} icon={Gauge} accent="blue"/><StatCard label="Métrica ativa" value={cfg.label} detail={cfg.subtitle} icon={ShieldCheck} accent="purple"/></div>
 <FilterBar><div className="flex flex-wrap gap-2">{METRICS.map(m=><button type="button" key={m.key} onClick={()=>setMetric(m.key)} className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${metric===m.key?"border-primary/45 bg-primary/10 text-primary":"border-border/60 bg-background/45 text-muted-foreground hover:text-foreground"}`}>{m.label}</button>)}</div></FilterBar>
 <SectionPanel title={`Ranking · ${cfg.label}`} subtitle={cfg.subtitle} icon={Zap}>{loading?<LoadingBlock h={360}/>:rows.length===0?<EmptyState title="Sem dados comparáveis" description="A métrica selecionada ainda não possui dados válidos para as unidades cadastradas."/>:<div className="space-y-2">{rows.map((row)=><Link key={row.shoppingId} to="/shoppings/$shoppingId" params={{shoppingId:row.shoppingId}} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl border border-border/55 bg-muted/10 px-4 py-3 transition hover:border-primary/30 hover:bg-muted/20"><div className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/50 text-sm font-semibold">{row.position}</div><div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{row.code}</span><span className="truncate text-sm font-medium">{row.name}</span></div><div className="mt-1"><StatusPill label={row.status==="otimo"?"Ótimo":row.status==="offline"?"Offline":row.status==="critico"?"Crítico":row.status==="atencao"?"Atenção":"Bom"} tone={row.status==="otimo"?"positive":row.status==="critico"?"danger":row.status==="atencao"?"warning":"neutral"}/></div></div><div className="text-right"><div className="metric-value text-xl">{formatNumber(row.value,{maximumFractionDigits:3})}</div><div className="text-[10px] text-muted-foreground">{row.unit}</div></div></Link>)}</div>}</SectionPanel>
 </InternalPage>
}
