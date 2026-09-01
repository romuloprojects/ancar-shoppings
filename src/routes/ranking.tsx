import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Gauge, Medal, ShieldCheck, Trophy, Zap } from "lucide-react";
import { dashboardService, type RankingMetric } from "@/services/dashboardService";
import type { RankingItem } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { FilterBar, InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { formatKwTr, formatMetric } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking" }] }),
  component: RankingPage,
});

const METRICS: { key: RankingMetric; label: string; subtitle: string }[] = [
  {
    key: "intensidade",
    label: "Intensidade elétrica",
    subtitle: "kW/TR elétrico para todas as unidades com potência CAG e produção térmica válidas",
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
];

function RankingPage() {
  const { tick } = useDashboardRuntime();
  const [metric, setMetric] = useState<RankingMetric>("intensidade");
  const [rows, setRows] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    dashboardService
      .getRanking(metric)
      .then((result) => {
        if (alive) setRows(result);
      })
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
    return formatMetric(value, unit, unit === "%" ? 1 : 1);
  };

  return (
    <InternalPage>
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
          detail={best ? best.code : "Sem dados"}
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
        <div className="flex w-full flex-wrap gap-2">
          {METRICS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setMetric(item.key)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
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

      <SectionPanel title={`Ranking · ${cfg.label}`} subtitle={cfg.subtitle} icon={Zap}>
        {loading ? (
          <LoadingBlock h={360} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Sem unidades cadastradas"
            description="A API não retornou unidades para o portfólio."
          />
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <Link
                key={row.shoppingId}
                to="/shoppings/$shoppingId"
                params={{ shoppingId: row.shoppingId }}
                className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-border/55 bg-muted/10 px-3 py-3 transition hover:border-primary/30 hover:bg-muted/20 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:px-4"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/50 text-sm font-semibold">
                  {row.position ?? "—"}
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{row.code}</span>
                    <span className="min-w-0 truncate text-sm font-medium">{row.name}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={statusText(row.status)}
                      tone={statusTone(row.status)}
                    />
                    {row.reason && <span className="text-[11px] text-muted-foreground">{row.reason}</span>}
                  </div>
                </div>

                <div className="col-span-2 text-left sm:col-span-1 sm:text-right">
                  <div className="metric-value text-xl">
                    {formatValue(row.value, row.unit)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{row.value === null ? row.reason ?? "Sem dado" : row.unit}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionPanel>
    </InternalPage>
  );
}

function statusText(status: RankingItem["status"]) {
  if (status === "otimo") return "Ótimo";
  if (status === "offline") return "Offline";
  if (status === "critico") return "Crítico";
  if (status === "atencao") return "Atenção";
  return "Bom";
}

function statusTone(status: RankingItem["status"]): "positive" | "danger" | "warning" | "neutral" {
  if (status === "otimo") return "positive";
  if (status === "critico") return "danger";
  if (status === "atencao") return "warning";
  return "neutral";
}
