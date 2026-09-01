import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Alert } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { FilterBar, InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/alertas")({ head: () => ({ meta: [{ title: "Central de Alertas" }] }), component: AlertsPage });

function AlertsPage(){
 const {tick}=useDashboardRuntime(); const [alerts,setAlerts]=useState<Alert[]>([]); const [loading,setLoading]=useState(true); const [severity,setSeverity]=useState("todos"); const [q,setQ]=useState("");
 useEffect(()=>{let alive=true;setLoading(true);dashboardService.getAlerts().then(r=>{if(alive)setAlerts(r)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[tick]);
 const filtered=useMemo(()=>alerts.filter(a=>{if(severity!=="todos"&&a.severity!==severity)return false;const query=q.trim().toLowerCase();return !query||a.title.toLowerCase().includes(query)||a.shoppingName.toLowerCase().includes(query)||a.shoppingCode.toLowerCase().includes(query)}),[alerts,severity,q]);
 const critical=alerts.filter(a=>a.severity==="critico").length, attention=alerts.filter(a=>a.severity==="atencao").length;
 return <InternalPage><PageHeader eyebrow="Operação atual" title="Central de Alertas" subtitle="Alertas gerados com os limites configurados por shopping e com a qualidade da aquisição." icon={Bell}/>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Alertas ativos" value={alerts.length} icon={Bell} accent="cyan"/><StatCard label="Críticos" value={critical} icon={ShieldAlert} accent={critical?"red":"green"}/><StatCard label="Atenção" value={attention} icon={AlertTriangle} accent={attention?"yellow":"green"}/><StatCard label="Sem alertas" value={alerts.length===0?"Sim":"Não"} icon={CheckCircle2} accent={alerts.length===0?"green":"blue"}/></div>
 <FilterBar><div className="relative w-full flex-1 sm:min-w-[220px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar alerta ou shopping" className="h-9 bg-background/55 pl-9"/></div><select value={severity} onChange={e=>setSeverity(e.target.value)} className="h-9 w-full rounded-lg border border-border/60 bg-background/55 px-3 text-sm sm:w-auto"><option value="todos">Todas as severidades</option><option value="critico">Crítico</option><option value="atencao">Atenção</option><option value="informativo">Informativo</option></select></FilterBar>
 <SectionPanel title="Condições ativas" subtitle="A tela mostra o estado atual; o histórico será consolidado nos relatórios operacionais." icon={AlertTriangle}>{loading?<LoadingBlock h={360}/>:filtered.length===0?<EmptyState title="Nenhum alerta encontrado" description="Não há condições ativas para os filtros selecionados."/>:<div className="space-y-2">{filtered.map(a=><div key={a.id} className="rounded-xl border border-border/55 bg-muted/10 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold">{a.title}</h2><StatusPill label={a.severity==="critico"?"Crítico":a.severity==="atencao"?"Atenção":"Informativo"} tone={a.severity==="critico"?"danger":a.severity==="atencao"?"warning":"info"}/></div><p className="mt-1 text-xs text-muted-foreground">{a.description}</p><p className="mt-2 text-xs"><span className="text-muted-foreground">Recomendação:</span> {a.recommendation}</p></div><div className="text-right text-xs text-muted-foreground"><Link to="/shoppings/$shoppingId" params={{shoppingId:a.shoppingId}} className="font-medium text-foreground hover:text-primary">{a.shoppingCode} · {a.shoppingName}</Link><div className="mt-1">{formatDateTime(a.date)}</div></div></div></div>)}</div>}</SectionPanel>
 </InternalPage>
}
