import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Download, FileBarChart, FileClock, FileText, LoaderCircle } from "lucide-react";
import { liveDashboardService } from "@/services/liveDashboardService";
import { reportService, type ReportPeriodsResponse } from "@/services/reportService";
import type { LiveShoppingSummary } from "@/types";
import { PageHeader } from "@/components/ui-helpers";
import { InternalPage } from "@/components/InternalPage";
import { Button } from "@/components/ui/button";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios | ANCAR" }] }),
  component: ReportsPage,
});

type ReportType = "daily" | "weekly" | "monthly" | "monthlyPortfolio";

function ReportsPage() {
  const { tick, selectedShoppingCode, setSelectedShoppingCode } = useDashboardRuntime();
  const [portfolio, setPortfolio] = useState<LiveShoppingSummary[]>([]);
  const [periods, setPeriods] = useState<ReportPeriodsResponse | null>(null);
  const [portfolioPeriods, setPortfolioPeriods] = useState<ReportPeriodsResponse | null>(null);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [downloadType, setDownloadType] = useState<ReportType | null>(null);
  const [message, setMessage] = useState("");
  const [dailyDate, setDailyDate] = useState("");
  const [weeklyEnd, setWeeklyEnd] = useState("");
  const [month, setMonth] = useState("");
  const [portfolioMonth, setPortfolioMonth] = useState("");

  useEffect(() => {
    let alive = true;
    liveDashboardService
      .getPortfolio()
      .then((response) => {
        if (!alive) return;
        setPortfolio(response.shoppings);
        if (
          response.shoppings.length &&
          !response.shoppings.some((shopping) => shopping.code === selectedShoppingCode)
        ) {
          setSelectedShoppingCode(response.shoppings[0].code);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [tick, selectedShoppingCode, setSelectedShoppingCode]);

  useEffect(() => {
    if (!selectedShoppingCode) return;
    let alive = true;
    setPeriodLoading(true);
    reportService
      .getPeriods(selectedShoppingCode, "shopping")
      .then((response) => {
        if (!alive) return;
        setPeriods(response);
        const complete = response.latestCompleteDate || response.latestDataDate || "";
        setDailyDate((value) => value || complete);
        setWeeklyEnd((value) => value || complete);
        setMonth((value) =>
          response.availableMonths.some((item) => item.month === value)
            ? value
            : response.availableMonths[0]?.month || "",
        );
      })
      .catch((error) => {
        if (!alive) return;
        setPeriods(null);
        setMessage(error instanceof Error ? error.message : "Não foi possível consultar períodos.");
      })
      .finally(() => {
        if (alive) setPeriodLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedShoppingCode, tick]);

  useEffect(() => {
    let alive = true;
    reportService
      .getPeriods("", "portfolio")
      .then((response) => {
        if (!alive) return;
        setPortfolioPeriods(response);
        setPortfolioMonth((value) =>
          response.availableMonths.some((item) => item.month === value)
            ? value
            : response.availableMonths[0]?.month || "",
        );
      })
      .catch(() => {
        if (alive) setPortfolioPeriods(null);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  useEffect(() => {
    setDailyDate("");
    setWeeklyEnd("");
    setMonth("");
    setMessage("");
  }, [selectedShoppingCode]);

  async function download(type: ReportType, anchor: string) {
    if (!anchor) {
      setMessage("Selecione um período disponível.");
      return;
    }
    setMessage("");
    setDownloadType(type);
    try {
      if (type === "monthlyPortfolio") {
        await reportService.downloadMonthlyPortfolio(anchor);
      } else {
        await reportService.download(type, selectedShoppingCode, anchor);
      }
      setMessage("PDF gerado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar o relatório.");
    } finally {
      setDownloadType(null);
    }
  }

  return (
    <InternalPage className="compact-page compact-reports-page">
      <PageHeader
        eyebrow="Relatórios consolidados e históricos"
        title="Relatórios"
        subtitle="Gere relatórios premium diários, semanais, mensais por shopping e o consolidado mensal do portfólio ANCAR."
        icon={FileText}
      />

      <div className="reports-control-strip panel">
        <label>
          Shopping
          <select
            value={selectedShoppingCode}
            onChange={(event) => setSelectedShoppingCode(event.target.value)}
          >
            {portfolio.map((shopping) => (
              <option key={shopping.code} value={shopping.code}>
                {shopping.code} · {shopping.name}
              </option>
            ))}
          </select>
        </label>
        <div className="reports-base-status">
          {periodLoading
            ? "Consultando períodos..."
            : periods?.earliestDataDate
              ? `Base desde ${formatDate(periods.earliestDataDate)}`
              : "Sem histórico consolidado"}
        </div>
      </div>

      <div className="report-generator-grid">
        <ReportGenerator
          icon={CalendarDays}
          title="Relatório diário"
          description="Consolidação de um dia completo, com leitura hora a hora."
          busy={downloadType === "daily"}
          onDownload={() => download("daily", dailyDate)}
        >
          <input
            type="date"
            value={dailyDate}
            max={periods?.latestCompleteDate || undefined}
            onChange={(event) => setDailyDate(event.target.value)}
          />
        </ReportGenerator>

        <ReportGenerator
          icon={FileClock}
          title="Relatório semanal"
          description="Sete dias completos encerrando na data selecionada."
          busy={downloadType === "weekly"}
          onDownload={() => download("weekly", weeklyEnd)}
        >
          <input
            type="date"
            value={weeklyEnd}
            max={periods?.latestCompleteDate || undefined}
            onChange={(event) => setWeeklyEnd(event.target.value)}
          />
        </ReportGenerator>

        <ReportGenerator
          icon={FileBarChart}
          title="Relatório mensal"
          description="Mês fechado do shopping, incluindo meses históricos já consolidados."
          busy={downloadType === "monthly"}
          onDownload={() => download("monthly", month)}
        >
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            disabled={!periods?.availableMonths?.length}
          >
            <option value="">Selecione um mês</option>
            {periods?.availableMonths.map((item) => (
              <option key={item.month} value={item.month}>
                {monthLabel(item.month)} · {item.daysWithData} dias com dados
              </option>
            ))}
          </select>
          <div className="report-history-note">
            Até os 6 meses fechados mais recentes existentes na base.
          </div>
        </ReportGenerator>

        <ReportGenerator
          icon={FileBarChart}
          title="Mensal · Portfólio ANCAR"
          description="Consolidado executivo do portfólio, com rankings e métricas normalizadas por área."
          busy={downloadType === "monthlyPortfolio"}
          onDownload={() => download("monthlyPortfolio", portfolioMonth)}
        >
          <select
            value={portfolioMonth}
            onChange={(event) => setPortfolioMonth(event.target.value)}
            disabled={!portfolioPeriods?.availableMonths?.length}
          >
            <option value="">Selecione um mês</option>
            {portfolioPeriods?.availableMonths.map((item) => (
              <option key={item.month} value={item.month}>
                {monthLabel(item.month)} · {item.shoppingsWithData ?? "—"} shoppings com dados
              </option>
            ))}
          </select>
          <div className="report-history-note">
            Até os 6 meses fechados mais recentes existentes no portfólio.
          </div>
        </ReportGenerator>
      </div>

      {message && <div className="report-message">{message}</div>}
    </InternalPage>
  );
}

function ReportGenerator({
  icon: Icon,
  title,
  description,
  busy,
  onDownload,
  children,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  busy: boolean;
  onDownload: () => void;
  children: ReactNode;
}) {
  return (
    <section className="panel report-generator-card">
      <div className="report-generator-head">
        <div className="report-generator-icon">
          <Icon />
        </div>
        <div className="report-generator-copy">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="report-generator-actions">
        <div className="report-generator-control">{children}</div>
        <Button size="sm" onClick={onDownload} disabled={busy}>
          {busy ? (
            <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          {busy ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  const names = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${names[Math.max(0, Number(month) - 1)] || month} de ${year}`;
}
