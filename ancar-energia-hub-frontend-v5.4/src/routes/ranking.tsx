import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Gauge, Medal, ShieldCheck, Trophy, Zap } from "lucide-react";
import { dashboardService, type RankingMetric } from "@/services/dashboardService";
import type { RankingItem } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { FilterBar, InternalPage, SectionPanel, StatCard } from "@/components/InternalPage";
import { formatBRL2, formatKwTr, formatMetric } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking" }] }),
  component: RankingPage,
});

const METRICS: { key: RankingMetric; label: string; subtitle: string }[] = [
  {
    key: "intensidade",
    label: "Eficiência Energética",
    subtitle: "Com meta: menor desvio percentual em relação à meta. Sem meta: fallback por kW/TR absoluto.",
  },
  {
    key: "eficiencia",
    label: "Eficiência elétrica comparável",
    subtitle: "kW/TR apenas entre unidades cuja medição elétrica integral é tecnicamente comparável",
  },
  { key: "energia", label: "Energia hoje", subtitle: "Energia elétrica acumulada desde 00:00" },
  { key: "potencia", label: "Potência", subtitle: "Potência instantânea da CAG" },
  { key: "producao", label: "Produção", subtitle: "Produção térmica instantânea" },
  { key: "perifericos", label: "Periféricos", subtitle: "Participação dos periféricos na potência da CAG" },
  { key: "qualidade", label: "Qualidade", subtitle: "Percentual de pontos válidos na última coleta" },
  { key: "balanco", label: "Balanço", subtitle: "Desvio entre potência total e soma das cargas medidas" },
  { key: "custo", label: "Custo energético", subtitle: "Custo de energia acumulado hoje pela tarifa configurada" },
  { key: "custoMeta", label: "Custo acima da meta", subtitle: "Custo estimado da energia consumida acima da Meta CAG" },
  { key: "custoTrh", label: "R$/TRh", subtitle: "Custo específico por TRh produzido" },
];

function RankingPage() {
  const { tick } = useDashboardRuntime();
  const [metric, setMetric] = useState<RankingMetric>("intensidade");
  const [rows, setRows] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedMetricRef = useRef<RankingMetric | null>(null);

  useEffect(() => {
    let alive = true;
    const metricChanged = loadedMetricRef.current !== metric;
    if (metricChanged) { setLoading(true); setRows([]); }
    dashboardService
      .getRanking(metric)
      .then((result) => {
        if (!alive) return;
        setRows(result);
        loadedMetricRef.current = metric;
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [metric, tick]);

  const cfg = METRICS.find((item) => item.key === metric)!;
  const validRows = rows.filter((row): row is RankingItem & { value: number } => row.value !== null);
  const best = validRows[0];
  const average = useMemo(
    () =>
      validRows.length
        ? validRows.reduce((sum, row) => sum + row.value, 0) / validRows.length
        : null,
    [validRows],
  );

  const formatValue = (value: number | null, unit?: string) => {
    if (unit === "kW/TR") return formatKwTr(value);
    if (unit === "R$" || unit === "R$/TRh") return formatBRL2(value);
    return formatMetric(value, unit, unit === "%" ? 1 : 1);
  };


  const rankingCriterionLabel = (row: RankingItem) => {
    if (metric !== "intensidade" || row.value === null) return null;
    if (row.targetDeviationPct === null || row.targetDeviationPct === undefined) {
      return "Sem meta · fallback por kW/TR";
    }
    const magnitude = Math.abs(row.targetDeviationPct).toFixed(1).replace(".", ",");
    if (Math.abs(row.targetDeviationPct) < 0.05) return "0,0% na meta";
    return `${magnitude}% ${row.targetDeviationPct < 0 ? "abaixo" : "acima"} da meta`;
  };

  return (
    <InternalPage className="compact-page compact-ranking-page">
      <PageHeader
        eyebrow="Comparação do portfólio"
        title="Ranking"
        subtitle="Compare indicadores derivados das fontes reais disponíveis sem ocultar unidades sem dado ou não comparáveis."
        icon={Trophy}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Unidades com valor"
          value={`${validRows.length} / ${rows.length}`}
          icon={BarChart3}
          accent="cyan"
        />
        <StatCard
          label="Melhor resultado"
          value={best ? formatValue(best.value, best.unit) : "—"}
          unit={best?.unit}
          detail={best ? (metric === "intensidade" ? `${best.code} · ${rankingCriterionLabel(best) ?? "sem meta"}` : best.code) : "Sem dados"}
          icon={Medal}
          accent="green"
        />
        <StatCard
          label="Média"
          value={formatValue(average, best?.unit)}
          unit={best?.unit}
          icon={Gauge}
          accent="blue"
        />
        <StatCard
          label="Métrica ativa"
          value={cfg.label}
          detail={cfg.subtitle}
          icon={ShieldCheck}
          accent="purple"
        />
      </div>

      <FilterBar>
        <div className="ranking-metric-strip flex w-full flex-nowrap gap-2 overflow-x-auto pb-0.5">
          {METRICS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setMetric(item.key)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                metric === item.key
                  ? "border-primary/45 bg-primary/10 text-primary"
                  : "border-border/60 bg-background/45 text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </FilterBar>

      <div className="ranking-workspace-body min-h-0 flex-1">
        <SectionPanel title={`Ranking · ${cfg.label}`} subtitle={cfg.subtitle} icon={Zap} className="compact-fill-panel" contentClassName="compact-scroll-region">
          {loading ? (
            <LoadingBlock h={360} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Sem unidades cadastradas"
              description="A API não retornou unidades para o portfólio."
            />
          ) : (
            <div className="space-y-1.5">
              {rows.map((row) => (
                <Link
                  key={row.shoppingId}
                  to="/shoppings/$shoppingId"
                  params={{ shoppingId: row.shoppingId }}
                  className="ranking-row-compact grid grid-cols-[34px_minmax(0,1fr)_minmax(110px,0.72fr)_88px] items-center gap-2 rounded-lg border border-border/45 bg-muted/10 px-2.5 py-1.5 transition hover:border-primary/30 hover:bg-muted/20"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-background/50 text-[11px] font-semibold">
                    {row.position ?? "—"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold">{row.code}</span>
                      <span className="min-w-0 truncate text-[11px] font-medium">{row.name}</span>
                    </div>
                    {rankingCriterionLabel(row) ? (
                      <div
                        className={`mt-0.5 truncate text-[9px] font-semibold ${
                          row.targetDeviationPct === null || row.targetDeviationPct === undefined
                            ? "text-muted-foreground"
                            : row.targetDeviationPct <= 0
                              ? "text-[var(--accent-green)]"
                              : "text-[var(--accent-red)]"
                        }`}
                      >
                        {rankingCriterionLabel(row)}
                      </div>
                    ) : row.reason ? (
                      <div className="mt-0.5 truncate text-[9px] text-muted-foreground">{row.reason}</div>
                    ) : null}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/45">
                    {row.value !== null && <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cyan),var(--accent-green))]" style={{width:`${Math.max(12, Math.min(100, 100 - ((row.position ?? rows.length)-1) * (75/Math.max(1,rows.length-1))))}%`}} />}
                  </div>
                  <div className="text-right">
                    <div className="metric-value text-sm">{formatValue(row.value, row.unit)}</div>
                    <div className="text-[9px] text-muted-foreground">{row.value === null ? "—" : row.unit}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionPanel>

        <aside className="ranking-side-panel panel min-h-0 overflow-hidden p-3">
          <div className="text-xs font-semibold">Leitura da comparação</div>
          <div className="mt-1 text-[10px] leading-relaxed text-muted-foreground">A métrica selecionada define quais unidades são tecnicamente comparáveis. Unidades sem dado continuam visíveis.</div>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><div className="text-[9px] uppercase tracking-[.12em] text-[var(--accent-green)]">Melhor resultado</div><div className="mt-1 text-sm font-semibold">{best ? `${best.code} · ${formatValue(best.value,best.unit)} ${best.unit ?? ""}` : "Sem dados"}</div></div>
            <div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><div className="text-[9px] uppercase tracking-[.12em] text-[var(--accent-cyan)]">Média do portfólio</div><div className="mt-1 text-sm font-semibold">{formatValue(average,best?.unit)} {best?.unit ?? ""}</div></div>
            <div className="rounded-lg border border-border/45 bg-muted/10 p-2.5"><div className="text-[9px] uppercase tracking-[.12em] text-[var(--accent-yellow)]">Cobertura</div><div className="mt-1 text-sm font-semibold">{validRows.length} de {rows.length} unidades com valor</div></div>
          </div>
        </aside>
      </div>
    </InternalPage>
  );
}

