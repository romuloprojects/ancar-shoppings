import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Alert } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/alertas")({ head: () => ({ meta: [{ title: "Central de Alertas" }] }), component: AlertsPage });

function AlertsPage(){
 const {tick}=useDashboardRuntime(); const [alerts,setAlerts]=useState<Alert[]>([]); const [loading,setLoading]=useState(true); const [severity,setSeverity]=useState("todos"); const [q,setQ]=useState("");
 useEffect(()=>{let alive=true;dashboardService.getAlerts().then(r=>{if(alive)setAlerts(r)}).catch(()=>{}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[tick]);
 const filtered=useMemo(()=>alerts.filter(a=>{if(severity!=="todos"&&a.severity!==severity)return false;const query=q.trim().toLowerCase();return !query||a.title.toLowerCase().includes(query)||a.shoppingName.toLowerCase().includes(query)||a.shoppingCode.toLowerCase().includes(query)}),[alerts,severity,q]);
 const critical=alerts.filter(a=>a.severity==="critico").length, attention=alerts.filter(a=>a.severity==="atencao").length;
 return <InternalPage className="compact-page compact-alerts-page"><PageHeader eyebrow="Operação atual" title="Central de Alertas" subtitle="Alertas de aquisição, Meta CAG, Meta Chillers e oportunidades operacionais por shopping." icon={Bell}/>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Alertas ativos" value={alerts.length} icon={Bell} accent="cyan"/><StatCard label="Críticos" value={critical} icon={ShieldAlert} accent={critical?"red":"green"}/><StatCard label="Atenção" value={attention} icon={AlertTriangle} accent={attention?"yellow":"green"}/><StatCard label="Sem alertas" value={alerts.length===0?"Sim":"Não"} icon={CheckCircle2} accent={alerts.length===0?"green":"blue"}/></div>
 <div className="alerts-workspace-body min-h-0 flex-1">
   <SectionPanel title="Condições ativas" subtitle="Estado atual do portfólio; o histórico é consolidado nos relatórios operacionais." icon={AlertTriangle} className="compact-fill-panel" contentClassName="compact-scroll-region">{loading?<LoadingBlock h={360}/>:filtered.length===0?<EmptyState title="Nenhum alerta encontrado" description="Não há condições ativas para os filtros selecionados."/>:<div className="space-y-1.5">{filtered.map(a=><div key={a.id} className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold">{a.shoppingCode}</span><h2 className="truncate text-[11px] font-semibold">{a.title}</h2><StatusPill label={a.severity==="critico"?"Crítico":a.severity==="atencao"?"Atenção":"Informativo"} tone={a.severity==="critico"?"danger":a.severity==="atencao"?"warning":"info"}/></div><p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{a.description}</p><p className="mt-1 line-clamp-1 text-[10px]"><span className="text-muted-foreground">Recomendação:</span> {a.recommendation}</p></div><div className="shrink-0 text-right text-[9px] text-muted-foreground"><Link to="/shoppings/$shoppingId" params={{shoppingId:a.shoppingId}} className="font-medium text-foreground hover:text-primary">{a.shoppingName}</Link><div className="mt-1">{formatDateTime(a.date)}</div></div></div></div>)}</div>}</SectionPanel>
   <aside className="alerts-side-stack min-h-0">
     <section className="panel p-3"><div className="text-xs font-semibold">Filtros</div><div className="mt-2 space-y-2"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar alerta ou shopping" className="h-9 bg-background/55 pl-9 text-xs"/></div><select value={severity} onChange={e=>setSeverity(e.target.value)} className="h-9 w-full rounded-lg border border-border/60 bg-background/55 px-3 text-xs"><option value="todos">Todas as severidades</option><option value="critico">Crítico</option><option value="atencao">Atenção</option><option value="informativo">Informativo</option></select><div className="text-[10px] text-muted-foreground">{filtered.length} de {alerts.length} alertas exibidos</div></div></section>
     <section className="panel min-h-0 overflow-y-auto p-3"><div className="text-xs font-semibold">Critérios vigentes</div><div className="mt-2 space-y-2 text-[10px]"><div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><div className="font-semibold">Metas por shopping</div><p className="mt-1 text-muted-foreground">Meta CAG e Meta Chillers geram alertas de eficiência quando o desempenho fica acima da referência do cliente.</p></div><div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><div className="font-semibold">Aquisição e fallback</div><p className="mt-1 text-muted-foreground">Falhas parciais, retries e valores sustentados pelo último válido de até 10 minutos aparecem separadamente da eficiência energética.</p></div></div></section>
   </aside>
 </div>
 </InternalPage>
}
