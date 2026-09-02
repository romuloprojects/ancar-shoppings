import { Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
import type { Shopping, ShoppingStatus } from "@/types";
import { formatBRL2, formatKwTr, formatNumber } from "@/utils/format";

const statusTheme: Record<ShoppingStatus, { label: string; color: string; background: string; border: string }> = {
  otimo: { label: "Ótimo", color: "var(--accent-green)", background: "color-mix(in oklab, var(--accent-green) 11%, transparent)", border: "color-mix(in oklab, var(--accent-green) 36%, transparent)" },
  bom: { label: "Bom", color: "var(--accent-cyan)", background: "color-mix(in oklab, var(--accent-cyan) 11%, transparent)", border: "color-mix(in oklab, var(--accent-cyan) 36%, transparent)" },
  atencao: { label: "Atenção", color: "var(--accent-yellow)", background: "color-mix(in oklab, var(--accent-yellow) 11%, transparent)", border: "color-mix(in oklab, var(--accent-yellow) 36%, transparent)" },
  critico: { label: "Crítico", color: "var(--accent-red)", background: "color-mix(in oklab, var(--accent-red) 11%, transparent)", border: "color-mix(in oklab, var(--accent-red) 36%, transparent)" },
  offline: { label: "Offline", color: "var(--muted-foreground)", background: "color-mix(in oklab, var(--muted-foreground) 9%, transparent)", border: "color-mix(in oklab, var(--muted-foreground) 28%, transparent)" },
};

export function ShoppingCard({ shopping }: { shopping: Shopping }) {
  const theme = statusTheme[shopping.status];
  const deviation = shopping.efficiencyKWTR !== null && shopping.targetKwTr !== null && shopping.targetKwTr > 0
    ? ((shopping.efficiencyKWTR - shopping.targetKwTr) / shopping.targetKwTr) * 100
    : null;
  const deviationText = deviation === null ? "Sem meta" : Math.abs(deviation) < 0.05 ? "Na meta" : `${Math.abs(deviation).toFixed(1).replace(".", ",")}% ${deviation < 0 ? "abaixo" : "acima"}`;
  const deviationTone = deviation === null ? "text-muted-foreground" : deviation <= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]";

  return (
    <Link to="/shoppings/$shoppingId" params={{ shoppingId: shopping.id }} aria-label={`Abrir ${shopping.name}`} title={shopping.name}
      className="group relative flex min-h-[146px] flex-col overflow-hidden rounded-xl border border-border/55 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_96%,transparent),color-mix(in_oklab,var(--background)_82%,transparent))] p-3.5 pb-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent-cyan)_48%,transparent)]">
      <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ color: theme.color, background: theme.color }} aria-label={theme.label}/>
      <div className="flex items-center gap-3 pr-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color-mix(in_oklab,var(--accent-blue)_28%,transparent)] bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklab,var(--accent-blue)_28%,transparent),color-mix(in_oklab,var(--card)_94%,transparent)_72%)]"><Building2 className="h-4.5 w-4.5 text-[var(--accent-blue)]" strokeWidth={1.8}/></div>
        <div className="min-w-0"><div className="text-base font-semibold tracking-wide text-foreground">{shopping.code}</div><div className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-3 w-3 shrink-0"/><span className="truncate">{shopping.city}/{shopping.stateCode}</span></div></div>
      </div>
      <div className="mt-3 grid grid-cols-3 divide-x divide-border/55 text-center">
        <Metric value={shopping.status === "offline" ? "—" : formatKwTr(shopping.efficiencyKWTR)} unit="kW/TR" label="Eficiência"/>
        <Metric value={shopping.status === "offline" ? "—" : deviationText} unit="vs meta" label="Desempenho" className={deviationTone}/>
        <Metric value={shopping.status === "offline" ? "—" : formatBRL2(shopping.costAboveTargetTodayBrl)} unit="hoje" label="Custo acima"/>
      </div>
      <div className="mt-auto rounded-md border px-2 py-1 text-center text-[10px] font-semibold" style={{ color: theme.color, background: theme.background, borderColor: theme.border }}>{theme.label}</div>
    </Link>
  );
}

function Metric({ value, unit, label, className="" }: { value: string; unit: string; label: string; className?: string }) {
  const compact = value.length > 10;
  return <div className="min-w-0 px-1 py-1"><div className={`metric-value truncate ${compact?"text-[11px]":"text-[14px]"} leading-none text-foreground ${className}`} title={value}>{value}</div><div className="mt-1 text-[8px] uppercase tracking-[0.06em] text-muted-foreground">{unit}</div><div className="mt-0.5 text-[8px] text-muted-foreground/70">{label}</div></div>;
}
