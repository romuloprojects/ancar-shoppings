import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Droplet, Leaf, Recycle, Shield, Sprout, Target, Users, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardService } from "@/services/dashboardService";
import type { ESGMetrics, RankingItem } from "@/types";
import { LoadingCards, PageHeader } from "@/components/ui-helpers";
import {
  chartTooltipStyle,
  InternalPage,
  SectionPanel,
  StatCard,
  StatusPill,
} from "@/components/InternalPage";
import { formatNumber } from "@/utils/format";

export const Route = createFileRoute("/esg")({
  head: () => ({ meta: [{ title: "Indicadores ESG" }] }),
  component: ESGPage,
});

function ESGPage() {
  const [esg, setEsg] = useState<ESGMetrics | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([dashboardService.getESGMetrics(), dashboardService.getRanking("esg")]).then(
      ([metrics, rankingItems]) => {
        if (!alive) return;
        setEsg(metrics);
        setRanking(rankingItems);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const bestShopping = ranking[0];
  const averageScore = useMemo(
    () =>
      ranking.length ? ranking.reduce((total, item) => total + item.value, 0) / ranking.length : 0,
    [ranking],
  );

  if (!esg) {
    return (
      <InternalPage>
        <PageHeader
          eyebrow="Sustentabilidade corporativa"
          title="Indicadores ESG"
          subtitle="Ambiental, Social e Governança do portfólio."
          icon={Leaf}
        />
        <LoadingCards count={6} />
      </InternalPage>
    );
  }

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Sustentabilidade corporativa"
        title="Indicadores ESG"
        subtitle="Consolidação dos indicadores ambientais, sociais e de governança do portfólio."
        icon={Leaf}
        right={<StatusPill label="Dados demonstrativos" tone="info" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Energia consumida"
          value={formatNumber(esg.energiaConsumidaMWh)}
          unit="MWh"
          icon={Zap}
          accent="cyan"
        />
        <StatCard
          label="Energia economizada"
          value={formatNumber(esg.energiaEconomizadaMWh)}
          unit="MWh"
          icon={Sprout}
          accent="green"
        />
        <StatCard
          label="Emissões"
          value={formatNumber(esg.emissoesT)}
          unit="t CO₂"
          icon={Leaf}
          accent="yellow"
        />
        <StatCard
          label="Emissões evitadas"
          value={formatNumber(esg.emissoesEvitadasT)}
          unit="t CO₂"
          icon={Leaf}
          accent="green"
        />
        <StatCard
          label="Intensidade energética"
          value={esg.intensidadeEnergetica}
          unit="kWh/m²"
          icon={Zap}
          accent="purple"
        />
        <StatCard
          label="Progresso da meta"
          value={esg.metaProgressoPct}
          unit="%"
          icon={Target}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <SectionPanel
          title="Ranking ESG por shopping"
          subtitle="Pontuação consolidada por unidade"
          icon={Leaf}
          contentClassName="pt-3"
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ranking.map((item) => ({ code: item.code, esg: item.value }))}
                margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="oklch(0.35 0.03 260 / 25%)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="code"
                  stroke="oklch(0.6 0.02 250)"
                  tick={{ fontSize: 9 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="oklch(0.6 0.02 250)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[60, 100]}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="esg" radius={[4, 4, 0, 0]} fill="var(--accent-green)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="ESG Score consolidado" subtitle="Composição dos pilares" icon={Shield}>
          <div className="relative mx-auto grid h-48 w-48 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="oklch(0.28 0.03 260)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--accent-green)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(esg.esgScore / 100) * 264} 264`}
              />
            </svg>
            <div className="text-center">
              <div className="metric-value text-4xl">{esg.esgScore}</div>
              <div className="text-xs text-muted-foreground">de 100</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <ScorePillar label="Ambiental" value={esg.ambiental} color="var(--accent-green)" />
            <ScorePillar label="Social" value={esg.social} color="var(--accent-purple)" />
            <ScorePillar label="Governança" value={esg.governanca} color="var(--accent-blue)" />
          </div>
          <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Melhor unidade</span>
              <span className="font-medium">{bestShopping?.code ?? "—"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Média do portfólio</span>
              <span className="metric-value">
                {formatNumber(averageScore, { maximumFractionDigits: 1 })}
              </span>
            </div>
          </div>
        </SectionPanel>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Energia renovável"
          value={esg.energiaRenovavelPct}
          unit="%"
          icon={Zap}
          accent="green"
        />
        <StatCard
          label="Consumo de água"
          value={formatNumber(esg.aguaM3)}
          unit="m³"
          icon={Droplet}
          accent="cyan"
        />
        <StatCard label="Resíduos" value={esg.residuosT} unit="t" icon={Recycle} accent="yellow" />
        <StatCard label="Pilar social" value={esg.social} unit="pts" icon={Users} accent="purple" />
        <StatCard
          label="Governança"
          value={esg.governanca}
          unit="pts"
          icon={Shield}
          accent="blue"
        />
      </div>
    </InternalPage>
  );
}

function ScorePillar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border/45 bg-muted/15 p-2.5">
      <div className="metric-value text-lg" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
