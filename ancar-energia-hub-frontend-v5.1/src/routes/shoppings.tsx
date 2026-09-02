import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, LayoutGrid, Search, ShieldCheck, Store, Table as TableIcon, Wifi } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { EmptyState, LoadingCards, PageHeader } from "@/components/ui-helpers";
import { ShoppingCard } from "@/components/ShoppingCard";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, InternalPage, StatCard } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL2, formatKwTr, formatNumber, formatRelative } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/shoppings")({
  head: () => ({ meta: [{ title: "Shoppings" }, { name: "description", content: "Portfólio de shoppings monitorados." }] }),
  component: ShoppingsPage,
});

const STATUS_OPTS = ["Todos", "otimo", "bom", "atencao", "critico", "offline"];
const QUALITIES = ["Todos", "alta", "media", "baixa"];

function ShoppingsPage() {
  const { tick } = useDashboardRuntime();
  const [list, setList] = useState<Shopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [q, setQ] = useState("");
  const [state, setState] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [quality, setQuality] = useState("Todos");

  useEffect(() => {
    let alive = true;
    dashboardService.getShoppings().then((items) => { if (alive) setList(items); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tick]);

  const states = useMemo(() => ["Todos", ...Array.from(new Set(list.map((s) => s.stateCode).filter((s) => s && s !== "--"))).sort()], [list]);
  const filtered = useMemo(() => list.filter((shopping) => {
    const query = q.toLowerCase().trim();
    if (query && !shopping.name.toLowerCase().includes(query) && !shopping.code.toLowerCase().includes(query) && !shopping.city.toLowerCase().includes(query)) return false;
    if (state !== "Todos" && shopping.stateCode !== state) return false;
    if (status !== "Todos" && shopping.status !== status) return false;
    if (quality !== "Todos" && shopping.dataQuality !== quality) return false;
    return true;
  }), [list, q, state, status, quality]);

  const summary = useMemo(() => {
    const online = list.filter((s) => s.status !== "offline").length;
    const attention = list.filter((s) => ["atencao", "critico"].includes(s.status)).length;
    const averageCoverage = list.length ? Math.round(list.reduce((a, s) => a + s.dataAvailability.coveragePct, 0) / list.length) : 0;
    return { online, attention, averageCoverage };
  }, [list]);

  return <InternalPage className="compact-page compact-shoppings-page">
    <PageHeader eyebrow="Portfólio operacional" title="Shoppings" subtitle="Acompanhe eficiência vs meta, custo acima da meta, disponibilidade e qualidade das CAGs." icon={Store}
      right={<div className="segmented-control" aria-label="Modo de visualização">
        <button type="button" data-active={view === "grid"} onClick={() => setView("grid")}><span className="flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Cards</span></button>
        <button type="button" data-active={view === "table"} onClick={() => setView("table")}><span className="flex items-center gap-1.5"><TableIcon className="h-3.5 w-3.5" /> Tabela</span></button>
      </div>} />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Unidades monitoradas" value={list.length} icon={Store} accent="cyan" />
      <StatCard label="Unidades online" value={summary.online} detail={`${list.length ? Math.round((summary.online/list.length)*100) : 0}% do portfólio`} icon={Wifi} accent="green" />
      <StatCard label="Em atenção" value={summary.attention} detail="Status atenção ou crítico" icon={AlertTriangle} accent={summary.attention ? "yellow" : "green"} />
      <StatCard label="Cobertura média" value={summary.averageCoverage} unit="%" detail="Pontos válidos na última coleta" icon={ShieldCheck} accent="blue" />
    </div>

    <FilterBar>
      <div className="relative w-full flex-[2_1_320px] sm:min-w-[220px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Buscar shopping" placeholder="Buscar por nome, sigla ou cidade" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 bg-background/55 pl-9"/></div>
      <Select label="Estado" value={state} onChange={setState} options={states}/>
      <Select label="Status" value={status} onChange={setStatus} options={STATUS_OPTS} labelMap={{otimo:"Ótimo",bom:"Bom",atencao:"Atenção",critico:"Crítico",offline:"Offline"}}/>
      <Select label="Qualidade" value={quality} onChange={setQuality} options={QUALITIES} labelMap={{alta:"Alta",media:"Média",baixa:"Baixa"}}/>
      <div className="w-full self-center text-xs text-muted-foreground lg:ml-auto lg:w-auto">{filtered.length} de {list.length} exibidos</div>
    </FilterBar>

    <div className="compact-scroll-region min-h-0">
      {loading ? <LoadingCards count={8}/> : filtered.length === 0 ? <EmptyState title="Nenhum shopping encontrado" description="Revise os filtros aplicados." icon={Search}/> : view === "grid" ?
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{filtered.map((shopping) => <ShoppingCard key={shopping.id} shopping={shopping}/>)}</div> :
      <div className="panel data-table-shell overflow-x-auto"><Table><TableHeader><TableRow>
        <TableHead>Shopping</TableHead><TableHead>Localização</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Potência</TableHead><TableHead className="text-right">kW/TR</TableHead><TableHead className="text-right">Vs meta</TableHead><TableHead className="text-right">Custo acima meta</TableHead><TableHead className="text-right">Cobertura</TableHead><TableHead className="text-right">Atualização</TableHead>
      </TableRow></TableHeader><TableBody>{filtered.map((shopping) => <TableRow key={shopping.id}>
        <TableCell><Link to="/shoppings/$shoppingId" params={{shoppingId:shopping.id}} className="flex items-center gap-2 font-medium hover:text-[var(--accent-cyan)]"><span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold">{shopping.code}</span>{shopping.name}</Link></TableCell>
        <TableCell className="text-muted-foreground">{shopping.city}/{shopping.stateCode}</TableCell><TableCell><StatusBadge status={shopping.status}/></TableCell>
        <TableCell className="metric-value text-right">{num(shopping.powerKW,1)} kW</TableCell><TableCell className="metric-value text-right">{formatKwTr(shopping.efficiencyKWTR)}</TableCell><TableCell className={`text-right text-xs font-semibold ${metaDev(shopping)<=0?"text-[var(--accent-green)]":"text-[var(--accent-red)]"}`}>{metaDevText(shopping)}</TableCell><TableCell className="metric-value text-right">{formatBRL2(shopping.costAboveTargetTodayBrl)}</TableCell><TableCell className="text-right">{shopping.dataAvailability.coveragePct}%</TableCell><TableCell className="text-right text-xs text-muted-foreground">{shopping.status === "offline" ? "—" : formatRelative(shopping.lastUpdate)}</TableCell>
      </TableRow>)}</TableBody></Table></div>}
    </div>
  </InternalPage>;
}

function num(v:number|null,d=1){return v===null?"—":formatNumber(v,{maximumFractionDigits:d});}
function Select({label,value,onChange,options,labelMap}:{label:string;value:string;onChange:(v:string)=>void;options:string[];labelMap?:Record<string,string>}){return <label className="flex w-full flex-1 flex-col gap-1 sm:min-w-[120px] text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground md:max-w-[170px]">{label}<select value={value} onChange={(e)=>onChange(e.target.value)} className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55">{options.map((o)=><option key={o} value={o}>{labelMap?.[o]??o}</option>)}</select></label>}

function metaDev(s:Shopping){return s.efficiencyKWTR!==null&&s.targetKwTr!==null&&s.targetKwTr>0?((s.efficiencyKWTR-s.targetKwTr)/s.targetKwTr)*100:Number.POSITIVE_INFINITY}
function metaDevText(s:Shopping){const d=metaDev(s);return Number.isFinite(d)?`${Math.abs(d).toFixed(1).replace(".",",")}% ${d<=0?"abaixo":"acima"}`:"Sem meta"}
