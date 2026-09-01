import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Clock3,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  Leaf,
  Search,
  Send,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/ui-helpers";
import {
  FilterBar,
  InternalPage,
  SectionPanel,
  StatCard,
  StatusPill,
} from "@/components/InternalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios" }] }),
  component: RelatoriosPage,
});

const reports = [
  {
    id: "diario",
    icon: CalendarClock,
    title: "Diário",
    category: "Operacional",
    desc: "Consolidado das últimas 24 horas de operação.",
    color: "var(--accent-cyan)",
  },
  {
    id: "semanal",
    icon: CalendarClock,
    title: "Semanal",
    category: "Operacional",
    desc: "Comparativo de eficiência e consumo dos últimos 7 dias.",
    color: "var(--accent-blue)",
  },
  {
    id: "mensal",
    icon: CalendarClock,
    title: "Mensal",
    category: "Executivo",
    desc: "Relatório executivo com KPIs e evolução mensal.",
    color: "var(--accent-purple)",
  },
  {
    id: "ranking",
    icon: Trophy,
    title: "Ranking",
    category: "Executivo",
    desc: "Ranking consolidado por métrica e período.",
    color: "var(--accent-yellow)",
  },
  {
    id: "esg",
    icon: Leaf,
    title: "ESG",
    category: "Sustentabilidade",
    desc: "Indicadores ambientais, sociais e de governança.",
    color: "var(--accent-green)",
  },
  {
    id: "eficiencia",
    icon: Gauge,
    title: "Eficiência",
    category: "Técnico",
    desc: "Análise detalhada de eficiência por shopping.",
    color: "var(--accent-cyan)",
  },
  {
    id: "alertas",
    icon: AlertTriangle,
    title: "Alertas",
    category: "Operacional",
    desc: "Histórico completo de alertas e resoluções.",
    color: "var(--accent-red)",
  },
  {
    id: "qualidade",
    icon: ShieldCheck,
    title: "Qualidade dos Dados",
    category: "Técnico",
    desc: "Cobertura e disponibilidade dos instrumentos.",
    color: "var(--accent-purple)",
  },
];

const recentReports = [
  ["Relatório mensal — Junho", "PDF", "Hoje, 09:42", "Concluído"],
  ["Ranking de eficiência", "XLSX", "Ontem, 17:18", "Concluído"],
  ["Alertas críticos — 7 dias", "PDF", "15/07, 15:04", "Concluído"],
  ["Resumo ESG — 2º trimestre", "PDF", "12/07, 11:25", "Agendado"],
];

function RelatoriosPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = ["Todos", ...Array.from(new Set(reports.map((report) => report.category)))];
  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        const matchesQuery = `${report.title} ${report.desc}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());
        const matchesCategory = category === "Todos" || report.category === category;
        return matchesQuery && matchesCategory;
      }),
    [query, category],
  );

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Exportação e distribuição"
        title="Relatórios"
        subtitle="Gere, visualize e agende relatórios operacionais, técnicos e executivos."
        icon={FileBarChart}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Modelos disponíveis"
          value={reports.length}
          icon={FileText}
          accent="cyan"
        />
        <StatCard label="Gerados este mês" value={28} icon={History} accent="blue" />
        <StatCard label="Agendamentos ativos" value={4} icon={Clock3} accent="purple" />
        <StatCard
          label="Última geração"
          value="09:42"
          detail="Hoje"
          icon={CalendarClock}
          accent="green"
        />
      </div>

      <FilterBar>
        <div className="relative min-w-[240px] flex-[1_1_420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar relatório"
            placeholder="Buscar modelo de relatório"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 bg-background/55 pl-9"
          />
        </div>
        <label className="flex min-w-[190px] flex-col gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-9 rounded-lg border border-border/60 bg-background/55 px-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary/55"
          >
            {categories.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="ml-auto self-center text-xs text-muted-foreground">
          {filtered.length} modelos exibidos
        </div>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {filtered.map((report) => (
          <article key={report.id} className="panel flex min-h-[230px] flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-xl border"
                style={{
                  color: report.color,
                  borderColor: `color-mix(in oklab, ${report.color} 28%, transparent)`,
                  background: `color-mix(in oklab, ${report.color} 10%, transparent)`,
                }}
              >
                <report.icon className="h-5 w-5" />
              </div>
              <StatusPill label={report.category} tone="neutral" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{report.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{report.desc}</p>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => toast.info(`Visualizando: ${report.title}`)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Visualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => toast.success(`PDF ${report.title} exportado (demo)`)}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => toast.success(`Excel ${report.title} exportado (demo)`)}
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => toast.info(`Envio agendado: ${report.title}`)}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Agendar
              </Button>
            </div>
          </article>
        ))}
      </div>

      <SectionPanel
        title="Histórico recente"
        subtitle="Últimos relatórios gerados ou agendados"
        icon={History}
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted/20 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Relatório</th>
                <th className="px-4 py-3 text-left">Formato</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(([name, format, date, status]) => (
                <tr key={name} className="border-t border-border/35">
                  <td className="px-4 py-3 font-medium">{name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format}</td>
                  <td className="px-4 py-3 text-muted-foreground">{date}</td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill
                      label={status}
                      tone={status === "Concluído" ? "positive" : "info"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </InternalPage>
  );
}
