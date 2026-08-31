import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  LayoutGrid,
  Search,
  ShieldCheck,
  Store,
  Table as TableIcon,
  Wifi,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { EmptyState, LoadingCards, PageHeader } from "@/components/ui-helpers";
import { ShoppingCard } from "@/components/ShoppingCard";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, InternalPage, StatCard } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatRelative } from "@/utils/format";

export const Route = createFileRoute("/shoppings")({
  head: () => ({
    meta: [
      { title: "Shoppings" },
      { name: "description", content: "Portfólio de shoppings monitorados." },
    ],
  }),
  component: ShoppingsPage,
});

const STATES = ["Todos", "SP", "RJ", "CE", "RN", "MT", "RO"];
const STATUS_OPTS = ["Todos", "otimo", "bom", "atencao", "critico", "offline"];
const QUALITIES = ["Todos", "alta", "media", "baixa"];
const EFF_BUCKETS = ["Todos", "≤ 0,65", "0,65 – 0,80", "> 0,80"];

function ShoppingsPage() {
  const [list, setList] = useState<Shopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [q, setQ] = useState("");
  const [state, setState] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [quality, setQuality] = useState("Todos");
  const [eff, setEff] = useState("Todos");

  useEffect(() => {
    let alive = true;
    dashboardService.getShoppings().then((items) => {
      if (!alive) return;
      setList(items);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return list.filter((shopping) => {
      const query = q.toLowerCase().trim();
      if (
        query &&
        !shopping.name.toLowerCase().includes(query) &&
        !shopping.code.toLowerCase().includes(query) &&
        !shopping.city.toLowerCase().includes(query)
      )
        return false;
      if (state !== "Todos" && shopping.stateCode !== state) return false;
      if (status !== "Todos" && shopping.status !== status) return false;
      if (quality !== "Todos" && shopping.dataQuality !== quality) return false;
      if (eff === "≤ 0,65" && shopping.efficiencyKWTR > 0.65) return false;
      if (
        eff === "0,65 – 0,80" &&
        (shopping.efficiencyKWTR < 0.65 || shopping.efficiencyKWTR > 0.8)
      )
        return false;
      if (eff === "> 0,80" && shopping.efficiencyKWTR <= 0.8) return false;
      return true;
    });
  }, [list, q, state, status, quality, eff]);

  const summary = useMemo(() => {
    const online = list.filter((shopping) => shopping.status !== "offline").length;
    const attention = list.filter((shopping) =>
      ["atencao", "critico"].includes(shopping.status),
    ).length;
    const averageCoverage = list.length
      ? Math.round(
          list.reduce((total, shopping) => total + shopping.dataAvailability.coveragePct, 0) /
            list.length,
        )
      : 0;
    return { online, attention, averageCoverage };
  }, [list]);

  const clearFilters = () => {
    setQ("");
    setState("Todos");
    setStatus("Todos");
    setQuality("Todos");
    setEff("Todos");
  };

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Portfólio operacional"
        title="Shoppings"
        subtitle="Acompanhe disponibilidade, qualidade dos dados e desempenho energético das unidades."
        icon={Store}
        right={
          <div className="segmented-control" aria-label="Modo de visualização">
            <button type="button" data-active={view === "grid"} onClick={() => setView("grid")}>
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Cards
              </span>
            </button>
            <button type="button" data-active={view === "table"} onClick={() => setView("table")}>
              <span className="flex items-center gap-1.5">
                <TableIcon className="h-3.5 w-3.5" /> Tabela
              </span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Unidades monitoradas" value={list.length} icon={Store} accent="cyan" />
        <StatCard
          label="Unidades online"
          value={summary.online}
          detail={`${list.length ? Math.round((summary.online / list.length) * 100) : 0}% do portfólio`}
          icon={Wifi}
          accent="green"
        />
        <StatCard
          label="Em atenção"
          value={summary.attention}
          detail="Status atenção ou crítico"
          icon={AlertTriangle}
          accent={summary.attention ? "yellow" : "green"}
        />
        <StatCard
          label="Cobertura média"
          value={summary.averageCoverage}
          unit="%"
          detail="Disponibilidade de instrumentação"
          icon={ShieldCheck}
          accent="blue"
        />
      </div>

      <FilterBar>
        <div className="relative min-w-[220px] flex-[2_1_320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar shopping"
            placeholder="Buscar por nome, sigla ou cidade"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="h-9 bg-background/55 pl-9"
          />
        </div>
        <Select label="Estado" value={state} onChange={setState} options={STATES} />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTS}
          labelMap={{
            otimo: "Ótimo",
            bom: "Bom",
            atencao: "Atenção",
            critico: "Crítico",
            offline: "Offline",
          }}
        />
        <Select
          label="Qualidade"
          value={quality}
          onChange={setQuality}
          options={QUALITIES}
          labelMap={{ alta: "Alta", media: "Média", baixa: "Baixa" }}
        />
        <Select label="Eficiência" value={eff} onChange={setEff} options={EFF_BUCKETS} />
        <div className="ml-auto self-center text-xs text-muted-foreground">
          {filtered.length} de {list.length} exibidos
        </div>
      </FilterBar>

      {loading ? (
        <LoadingCards count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum shopping encontrado"
          description="Revise os filtros aplicados ou limpe a busca para visualizar o portfólio completo."
          icon={Search}
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
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((shopping) => (
            <ShoppingCard key={shopping.id} shopping={shopping} />
          ))}
        </div>
      ) : (
        <div className="panel data-table-shell overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shopping</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Potência</TableHead>
                <TableHead className="text-right">Consumo</TableHead>
                <TableHead className="text-right">Eficiência</TableHead>
                <TableHead className="text-right">ESG</TableHead>
                <TableHead className="text-right">Cobertura</TableHead>
                <TableHead className="text-right">Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((shopping) => (
                <TableRow key={shopping.id}>
                  <TableCell>
                    <Link
                      to="/shoppings/$shoppingId"
                      params={{ shoppingId: shopping.id }}
                      className="flex items-center gap-2 font-medium hover:text-[var(--accent-cyan)]"
                    >
                      <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold">
                        {shopping.code}
                      </span>
                      {shopping.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shopping.city}/{shopping.stateCode}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={shopping.status} />
                  </TableCell>
                  <TableCell className="metric-value text-right">
                    {formatNumber(shopping.powerKW / 1000, { maximumFractionDigits: 2 })} MW
                  </TableCell>
                  <TableCell className="metric-value text-right">
                    {formatNumber(shopping.consumptionMWh, { maximumFractionDigits: 1 })} MWh
                  </TableCell>
                  <TableCell className="metric-value text-right">
                    {formatNumber(shopping.efficiencyKWTR, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="metric-value text-right">{shopping.esgScore}</TableCell>
                  <TableCell className="text-right">
                    {shopping.dataAvailability.coveragePct}%
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatRelative(shopping.lastUpdate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </InternalPage>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labelMap,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labelMap?: Record<string, string>;
}) {
  return (
    <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground md:max-w-[170px]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelMap?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
