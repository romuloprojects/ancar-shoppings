import { buildCurrentAlerts, liveDashboardService, mapLiveShoppingToLegacy } from "@/services/liveDashboardService";
import type { Alert, RankingItem, Shopping } from "@/types";
import type { HistoryPeriod, ShoppingApiResponse } from "@/types/live";

export type RankingMetric = "eficiencia" | "energia" | "potencia" | "producao" | "perifericos" | "qualidade" | "balanco";

export const dashboardService = {
  async getShoppings(): Promise<Shopping[]> {
    return liveDashboardService.getShoppings();
  },

  async getShoppingById(id: string, period: HistoryPeriod = "24h"): Promise<ShoppingApiResponse | null> {
    const portfolio = await liveDashboardService.getPortfolio();
    const found = portfolio.shoppings.find((s) => s.id === id || s.code.toLowerCase() === id.toLowerCase());
    if (!found) return null;
    return liveDashboardService.getShopping(found.code, period);
  },

  async getRanking(metric: RankingMetric = "eficiencia"): Promise<RankingItem[]> {
    const portfolio = await liveDashboardService.getPortfolio();
    const rows = portfolio.shoppings.map((raw) => ({ raw, shopping: mapLiveShoppingToLegacy(raw) }));
    const valueFor = ({ raw, shopping }: (typeof rows)[number]): number | null => {
      switch (metric) {
        case "eficiencia": return raw.registry.chillersAbsorption > 0 ? null : shopping.efficiencyKWTR;
        case "energia": return shopping.energyTodayKwh;
        case "potencia": return shopping.powerKW;
        case "producao": return shopping.thermalLoadTR;
        case "perifericos": return shopping.peripheralsPct;
        case "qualidade": return shopping.dataQualityPct;
        case "balanco": return shopping.balanceDeviationPct;
      }
    };
    const lower = new Set<RankingMetric>(["eficiencia", "perifericos", "balanco"]);
    const unit: Record<RankingMetric, string> = { eficiencia: "kW/TR", energia: "kWh", potencia: "kW", producao: "TR", perifericos: "%", qualidade: "%", balanco: "%" };
    return rows
      .map((row) => ({ ...row, value: valueFor(row) }))
      .filter((row): row is typeof row & { value: number } => row.value !== null && Number.isFinite(row.value))
      .sort((a, b) => lower.has(metric) ? a.value - b.value : b.value - a.value)
      .map((row, index) => ({ position: index + 1, shoppingId: row.shopping.id, code: row.shopping.code, name: row.shopping.name, value: row.value, unit: unit[metric], status: row.shopping.status, comparable: true }));
  },

  async getAlerts(): Promise<Alert[]> {
    const portfolio = await liveDashboardService.getPortfolio();
    return buildCurrentAlerts(portfolio.shoppings);
  },
};
