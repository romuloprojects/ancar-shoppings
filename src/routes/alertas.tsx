import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, Bell, CheckCircle2, Info, Search, Siren } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Alert, AlertSeverity, AlertStatus } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { FilterBar, InternalPage, StatCard, StatusPill } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import { alertStatusLabel, formatDateTime, severityLabel } from "@/utils/format";

export const Route = createFileRoute("/alertas")({
  head: () => ({ meta: [{ title: "Central de Alertas" }] }),
  component: AlertasPage,
});

const severityIcon = (severity: AlertSeverity) =>
  severity === "critico" ? (
    <AlertOctagon className="h-4 w-4 text-[var(--accent-red)]" />
  ) : severity === "atencao" ? (
    <AlertTriangle className="h-4 w-4 text-[var(--accent-yellow)]" />
  ) : (
    <Info className="h-4 w-4 text-[var(--accent-cyan)]" />
  );

const severityTone = (severity: AlertSeverity) =>
  severity === "critico" ? "danger" : severity === "atencao" ? "warning" : "info";

function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<"todos" | AlertSeverity>("todos");
  const [status, setStatus] = useState<"todos" | AlertStatus>("todos");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    dashboardService.getAlerts().then((result) => {
      if (!alive) return;
      setAlerts(result);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      alerts.filter((alert) => {
        if (severity !== "todos" && alert.severity !== severity) return false;
        if (status !== "todos" && alert.status !== status) return false;
        const query = q.toLowerCase().trim();
        if (
          query &&
          !alert.title.toLowerCase().includes(query) &&
          !alert.shoppingName.toLowerCase().includes(query) &&
          !alert.shoppingCode.toLowerCase().includes(query) &&
          !alert.equipment.toLowerCase().includes(query)
        )
          return false;
        return true;
      }),
    [alerts, severity, status, q],
  );

  const counts = useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((alert) => alert.severity === "critico").length,
      attention: alerts.filter((alert) => alert.severity === "atencao").length,
      open: alerts.filter((alert) => ["novo", "em_analise"].includes(alert.status)).length,
    }),
    [alerts],
  );

  const clearFilters = () => {
    setQ("");
    setSeverity("todos");
    setStatus("todos");
  };

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Operação e manutenção"
        title="Central de Alertas"
        subtitle="Priorize desvios, acompanhe recomendações e monitore o tratamento dos eventos."
        icon={Bell}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Eventos registrados" value={counts.total} icon={Bell} accent="cyan" />
        <StatCard
          label="Críticos"
          value={counts.critical}
          detail="Requerem priorização operacional"
          icon={Siren}
          accent="red"
        />
        <StatCard
          label="Em atenção"
          value={counts.attention}
          detail="Desvios com impacto potencial"
          icon={AlertTriangle}
          accent="yellow"
        />
        <StatCard
          label="Em aberto"
          value={counts.open}
          detail="Novos ou em análise"
          icon={CheckCircle2}
          accent={counts.open ? "purple" : "green"}
        />
      </div>

      <FilterBar>
        <div className="relative min-w-[250px] flex-[1_1_420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar alerta"
            placeholder="Buscar por evento, shopping, sigla ou equipamento"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="h-9 bg-background/55 pl-9"
          />
        </div>
        <label className="flex min-w-[180px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Severidade
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as "todos" | AlertSeverity)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
          >
            <option value="todos">Todas as severidades</option>
            <option value="informativo">Informativo</option>
            <option value="atencao">Atenção</option>
            <option value="critico">Crítico</option>
          </select>
        </label>
        <label className="flex min-w-[180px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "todos" | AlertStatus)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
          >
            <option value="todos">Todos os status</option>
            <option value="novo">Novo</option>
            <option value="em_analise">Em análise</option>
            <option value="reconhecido">Reconhecido</option>
            <option value="resolvido">Resolvido</option>
          </select>
        </label>
        <div className="ml-auto self-center text-xs text-muted-foreground">
          {filtered.length} eventos exibidos
        </div>
      </FilterBar>

      {loading ? (
        <LoadingBlock h={600} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum alerta encontrado"
          description="Não existem eventos compatíveis com os filtros selecionados."
          icon={Bell}
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium hover:bg-muted/50"
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[40px_minmax(260px,1.6fr)_minmax(180px,.8fr)_130px_155px] gap-4 border-b border-border/50 bg-muted/25 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
            <span />
            <span>Evento e recomendação</span>
            <span>Origem</span>
            <span>Status</span>
            <span className="text-right">Data</span>
          </div>
          <div className="divide-y divide-border/40">
            {filtered.map((alert) => (
              <article
                key={alert.id}
                className="grid gap-3 px-4 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--accent-cyan)_4%,transparent)] lg:grid-cols-[40px_minmax(260px,1.6fr)_minmax(180px,.8fr)_130px_155px] lg:items-start lg:gap-4"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/25">
                  {severityIcon(alert.severity)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium">{alert.title}</h2>
                    <StatusPill
                      label={severityLabel(alert.severity)}
                      tone={severityTone(alert.severity)}
                    />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {alert.description}
                  </p>
                  <div className="mt-2 rounded-lg border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan)]/5 px-2.5 py-2 text-[11px] text-[var(--accent-cyan)]">
                    {alert.recommendation}
                  </div>
                </div>
                <div className="text-xs">
                  <Link
                    to="/shoppings/$shoppingId"
                    params={{ shoppingId: alert.shoppingId }}
                    className="font-medium hover:text-[var(--accent-cyan)]"
                  >
                    {alert.shoppingName}
                  </Link>
                  <div className="mt-1 text-muted-foreground">
                    {alert.shoppingCode} · {alert.equipment}
                  </div>
                </div>
                <div>
                  <StatusPill
                    label={alertStatusLabel(alert.status)}
                    tone={alert.status === "resolvido" ? "positive" : "neutral"}
                  />
                </div>
                <time className="text-xs text-muted-foreground lg:text-right">
                  {formatDateTime(alert.date)}
                </time>
              </article>
            ))}
          </div>
        </div>
      )}
    </InternalPage>
  );
}
