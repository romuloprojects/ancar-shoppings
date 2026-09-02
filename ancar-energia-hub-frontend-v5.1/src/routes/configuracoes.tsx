import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Gauge, Save, Settings, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { liveDashboardService, normalizeSettings } from "@/services/liveDashboardService";
import type { LiveShoppingSummary, ShoppingSettings } from "@/types";
import { LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage, SectionPanel } from "@/components/InternalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/configuracoes")({ head: () => ({ meta: [{ title: "Configurações" }] }), component: SettingsPage });

type FormState = { targetKwTr: string; targetChillerKwTr: string; energyTariffBrlMwh: string };

function SettingsPage(){
 const {tick,refreshNow,selectedShoppingCode,setSelectedShoppingCode}=useDashboardRuntime();
 const [portfolio,setPortfolio]=useState<LiveShoppingSummary[]>([]); const [settings,setSettings]=useState<ShoppingSettings>(normalizeSettings()); const [form,setForm]=useState<FormState>(toForm(normalizeSettings())); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState<string|null>(null);
 useEffect(()=>{let alive=true;liveDashboardService.getPortfolio().then(p=>{if(!alive)return;setPortfolio(p.shoppings);if(p.shoppings.length&&!p.shoppings.some(s=>s.code===selectedShoppingCode))setSelectedShoppingCode(p.shoppings[0].code)}).catch(()=>{});return()=>{alive=false}},[tick,selectedShoppingCode,setSelectedShoppingCode]);
 useEffect(()=>{if(!selectedShoppingCode)return;let alive=true;setLoading(true);liveDashboardService.getSettings(selectedShoppingCode).then(r=>{if(!alive)return;setSettings(r.settings);setForm(toForm(r.settings));setError(null)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:"Falha ao carregar configurações")}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[selectedShoppingCode]);
 const current=useMemo(()=>portfolio.find(s=>s.code===selectedShoppingCode)??null,[portfolio,selectedShoppingCode]);
 const save=async()=>{setSaving(true);try{const payload={...settings,targetKwTr:parsePositive(form.targetKwTr,"Meta CAG"),targetChillerKwTr:parsePositive(form.targetChillerKwTr,"Meta Chillers"),energyTariffBrlMwh:parseNonNegative(form.energyTariffBrlMwh,"Tarifa de energia")};const result=await liveDashboardService.saveSettings(selectedShoppingCode,payload);setSettings(result.settings);setForm(toForm(result.settings));refreshNow();toast.success("Energia e metas salvas para o shopping.");}catch(e){toast.error(e instanceof Error?e.message:"Falha ao salvar configurações.")}finally{setSaving(false)}};
 return <InternalPage className="compact-page compact-settings-page">
  <PageHeader eyebrow="Parâmetros fornecidos pelo cliente" title="Configurações" subtitle="Somente tarifa de energia, meta da CAG e meta dos chillers são editáveis. Os demais critérios técnicos permanecem internos ao sistema." icon={Settings} right={<Button onClick={save} disabled={saving||loading}><Save className="mr-1.5 h-3.5 w-3.5"/>{saving?"Salvando...":"Salvar alterações"}</Button>}/>
  <div className="panel p-3"><label className="flex w-full max-w-xl flex-col gap-1 text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">Shopping<select value={selectedShoppingCode} onChange={e=>setSelectedShoppingCode(e.target.value)} className="mt-1 h-10 rounded-lg border border-border/60 bg-background/55 px-3 text-sm font-normal normal-case tracking-normal text-foreground">{portfolio.map(s=><option key={s.code} value={s.code}>{s.code} · {s.name}</option>)}</select></label></div>
  {error&&<div className="rounded-lg border border-[var(--accent-red)]/25 bg-[var(--accent-red)]/8 px-3 py-2 text-xs text-[var(--accent-red)]">{error}</div>}
  {loading?<LoadingBlock h={420}/>:<div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
   <SectionPanel title="Energia e metas" subtitle={current?`${current.code} · ${current.name}`:"Shopping selecionado"} icon={Gauge} className="compact-fill-panel">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Field icon={Gauge} label="Meta CAG" value={form.targetKwTr} onChange={v=>setForm(f=>({...f,targetKwTr:v}))} unit="kW/TR" placeholder="Ex.: 0,78" help="Meta de eficiência do sistema CAG completo."/>
      <Field icon={Snowflake} label="Meta Chillers" value={form.targetChillerKwTr} onChange={v=>setForm(f=>({...f,targetChillerKwTr:v}))} unit="kW/TR" placeholder="Ex.: 0,65" help="Meta padrão para comparar a eficiência dos chillers elétricos."/>
      <Field icon={BadgeDollarSign} label="Tarifa de energia" value={form.energyTariffBrlMwh} onChange={v=>setForm(f=>({...f,energyTariffBrlMwh:v}))} unit="R$/MWh" placeholder="Ex.: 543,00" help="Tarifa usada nos cálculos econômicos. O sistema converte internamente para R$/kWh."/>
    </div>
    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground"><div className="font-semibold text-foreground">Como estes parâmetros são usados</div><div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2"><p><b className="text-foreground">Meta CAG:</b> ranking, % vs meta, custo acima da meta e tempo dentro da meta.</p><p><b className="text-foreground">Meta Chillers:</b> comparação individual dos chillers e oportunidades por equipamento.</p><p><b className="text-foreground">Tarifa:</b> custo energético, custo acima da meta, R$/TRh e oportunidades estimadas.</p><p>Valores são versionados no PostgreSQL; alterações futuras não reescrevem o histórico anterior.</p></div></div>
   </SectionPanel>
   <aside className="panel p-4"><div className="text-sm font-semibold">Configuração vigente</div><div className="mt-3 space-y-3 text-xs"><Current label="Meta CAG" value={settings.targetKwTr==null?"Não configurada":`${fmt(settings.targetKwTr)} kW/TR`}/><Current label="Meta Chillers" value={settings.targetChillerKwTr==null?"Não configurada":`${fmt(settings.targetChillerKwTr)} kW/TR`}/><Current label="Tarifa" value={settings.energyTariffBrlMwh==null?"Não configurada":`R$ ${fmt(settings.energyTariffBrlMwh,2)} / MWh`}/><Current label="Versão" value={settings.version==null?"—":String(settings.version)}/><Current label="Vigente desde" value={settings.validFrom?formatDateTime(settings.validFrom):"—"}/></div></aside>
  </div>}
 </InternalPage>
}
function toForm(s:ShoppingSettings):FormState{return{targetKwTr:toText(s.targetKwTr),targetChillerKwTr:toText(s.targetChillerKwTr),energyTariffBrlMwh:toText(s.energyTariffBrlMwh)}}
function toText(v:number|null|undefined){return v==null?"":String(v).replace(".",",")}
function parseNumber(v:string){const raw=v.trim();const t=raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw;if(!t)return null;const n=Number(t);if(!Number.isFinite(n))throw new Error("Valor numérico inválido.");return n}
function parsePositive(v:string,label:string){const n=parseNumber(v);if(n!==null&&n<=0)throw new Error(`${label} deve ser maior que zero.`);return n}
function parseNonNegative(v:string,label:string){const n=parseNumber(v);if(n!==null&&n<0)throw new Error(`${label} não pode ser negativa.`);return n}
function fmt(v:number,d=2){return new Intl.NumberFormat("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d}).format(v)}
function Field({icon:Icon,label,value,onChange,unit,placeholder,help}:{icon:typeof Gauge;label:string;value:string;onChange:(v:string)=>void;unit:string;placeholder:string;help:string}){return <label className="rounded-xl border border-border/55 bg-muted/10 p-4"><div className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4 text-primary"/>{label}</div><div className="relative mt-3"><Input inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-11 bg-background/55 pr-20 text-base font-semibold"/><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span></div><p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{help}</p></label>}
function Current({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2"><span className="text-muted-foreground">{label}</span><span className="text-right font-semibold">{value}</span></div>}
