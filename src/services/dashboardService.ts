import { USE_MOCK_DATA } from "@/config";
import type {
  Alert,
  ESGMetrics,
  EnergyDataPoint,
  PortfolioKpi,
  RankingItem,
  Shopping,
  ShoppingDetail,
  Insight,
} from "@/types";
import { shoppings } from "@/data/mock/shoppings";
import {
  computePortfolioKpi,
  makeAlerts,
  makeDaily,
  makeESG,
  makeEquipments,
  makeInsights,
  makeMonthly,
  makePortfolioSeries,
  makeRanking,
  makeWeekly,
} from "@/data/mock/generators";

// Simula pequena latência
const wait = <T>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const dashboardService = {
  async getPortfolioOverview(): Promise<{
    kpi: PortfolioKpi;
    series: EnergyDataPoint[];
    ranking: RankingItem[];
    shoppings: Shopping[];
    insights: Insight[];
    esg: ESGMetrics;
    lastUpdate: string;
  }> {
    if (!USE_MOCK_DATA) throw new Error("Integração não configurada");
    return wait({
      kpi: computePortfolioKpi(),
      series: makePortfolioSeries(),
      ranking: makeRanking("eficiencia"),
      shoppings,
      insights: makeInsights(),
      esg: makeESG(),
      lastUpdate: new Date().toISOString(),
    });
  },

  async getShoppings(): Promise<Shopping[]> {
    return wait(shoppings);
  },

  async getShoppingById(id: string): Promise<ShoppingDetail | null> {
    const base = shoppings.find((s) => s.id === id || s.code.toLowerCase() === id.toLowerCase());
    if (!base) return wait(null);
    const seed = base.code.charCodeAt(0) + base.code.charCodeAt(1);
    const detail: ShoppingDetail = {
      ...base,
      dailyConsumption: makeDaily(seed),
      weeklyConsumption: makeWeekly(seed),
      monthlyConsumption: makeMonthly(seed),
      chillerPower: [
        { name: "Chiller 01", kw: Math.round(base.powerKW * 0.22) },
        { name: "Chiller 02", kw: Math.round(base.powerKW * 0.19) },
        { name: "Chiller 03", kw: Math.round(base.powerKW * 0.15) },
        { name: "Chiller 04", kw: Math.round(base.powerKW * 0.1) },
      ],
      peripheralPower: [
        { name: "Torres", kw: Math.round(base.powerKW * 0.08) },
        { name: "Bombas CAP", kw: Math.round(base.powerKW * 0.07) },
        { name: "Bombas CAG", kw: Math.round(base.powerKW * 0.06) },
        { name: "AHUs", kw: Math.round(base.powerKW * 0.13) },
      ],
      temperatures: [
        { name: "Água gelada — Saída", value: 6.8, unit: "°C" },
        { name: "Água gelada — Retorno", value: 12.2, unit: "°C" },
        { name: "Condensação — Entrada", value: 29.4, unit: "°C" },
        {
          name: "Condensação — Saída",
          value: base.dataAvailability.temperaturas ? 34.6 : null,
          unit: "°C",
        },
      ],
      equipments: makeEquipments(seed),
      alerts: makeAlerts(base.id),
      insights: makeInsights(),
    };
    return wait(detail);
  },

  async getRanking(
    metric: Parameters<typeof makeRanking>[0] = "eficiencia",
  ): Promise<RankingItem[]> {
    return wait(makeRanking(metric));
  },

  async getAlerts(): Promise<Alert[]> {
    return wait(makeAlerts());
  },

  async getESGMetrics(): Promise<ESGMetrics> {
    return wait(makeESG());
  },

  async getAnalytics(params: {
    shoppingIds: string[];
    metric: "consumo" | "eficiencia";
  }): Promise<{ id: string; code: string; series: EnergyDataPoint[] }[]> {
    const list = shoppings.filter((s) => params.shoppingIds.includes(s.id));
    return wait(
      list.map((s) => ({
        id: s.id,
        code: s.code,
        series: makeDaily(s.code.charCodeAt(0) + params.metric.length),
      })),
    );
  },
};
