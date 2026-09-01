import {
  buildCurrentAlerts,
  liveDashboardService,
  mapLiveShoppingToLegacy,
} from "@/services/liveDashboardService";
import type { Alert, RankingItem, Shopping } from "@/types";
import type { HistoryPeriod, ShoppingApiResponse } from "@/types/live";

export type RankingMetric =
  | "intensidade"
  | "eficiencia"
  | "energia"
  | "potencia"
  | "producao"
  | "perifericos"
  | "qualidade"
  | "balanco";

export const dashboardService = {
  async getShoppings(): Promise<Shopping[]> {
    return liveDashboardService.getShoppings();
  },

  async getShoppingById(
    id: string,
    period: HistoryPeriod = "24h",
  ): Promise<ShoppingApiResponse | null> {
    const portfolio = await liveDashboardService.getPortfolio();
    const found = portfolio.shoppings.find(
      (shopping) => shopping.id === id || shopping.code.toLowerCase() === id.toLowerCase(),
    );
    if (!found) return null;
    return liveDashboardService.getShopping(found.code, period);
  },

  async getRanking(metric: RankingMetric = "intensidade"): Promise<RankingItem[]> {
    const portfolio = await liveDashboardService.getPortfolio();
    const rows = portfolio.shoppings.map((raw) => ({
      raw,
      shopping: mapLiveShoppingToLegacy(raw),
    }));

    const valueFor = ({ raw, shopping }: (typeof rows)[number]): number | null => {
      switch (metric) {
        case "intensidade":
          return shopping.efficiencyKWTR;
        case "eficiencia":
          return raw.registry.chillersAbsorption > 0 ? null : shopping.efficiencyKWTR;
        case "energia":
          return shopping.energyTodayKwh;
        case "potencia":
          return shopping.powerKW;
        case "producao":
          return shopping.thermalLoadTR;
        case "perifericos":
          return shopping.peripheralsPct;
        case "qualidade":
          return shopping.dataQualityPct;
        case "balanco":
          return shopping.balanceDeviationPct;
      }
    };

    const lower = new Set<RankingMetric>(["intensidade", "eficiencia", "perifericos", "balanco"]);
    const unit: Record<RankingMetric, string> = {
      intensidade: "kW/TR",
      eficiencia: "kW/TR",
      energia: "kWh",
      potencia: "kW",
      producao: "TR",
      perifericos: "%",
      qualidade: "%",
      balanco: "%",
    };

    const evaluated = rows.map((row) => {
      const rawValue = valueFor(row);
      const comparable = metric !== "eficiencia" || row.raw.registry.chillersAbsorption === 0;
      const stale = row.shopping.status === "offline";
      const value = stale ? null : rawValue;
      const reason = stale
        ? "Dados desatualizados"
        : !comparable
          ? "Não comparável nesta métrica"
          : value === null || !Number.isFinite(value)
            ? "Sem dado disponível"
            : undefined;
      return { ...row, value, comparable, reason };
    });

    const valid = evaluated
      .filter((row): row is typeof row & { value: number } => row.value !== null && Number.isFinite(row.value))
      .sort((a, b) => (lower.has(metric) ? a.value - b.value : b.value - a.value));

    const positions = new Map(valid.map((row, index) => [row.shopping.id, index + 1]));

    return evaluated
      .sort((a, b) => {
        const positionA = positions.get(a.shopping.id) ?? Number.POSITIVE_INFINITY;
        const positionB = positions.get(b.shopping.id) ?? Number.POSITIVE_INFINITY;
        if (positionA !== positionB) return positionA - positionB;
        return a.shopping.name.localeCompare(b.shopping.name, "pt-BR");
      })
      .map((row) => ({
        position: positions.get(row.shopping.id) ?? null,
        shoppingId: row.shopping.id,
        code: row.shopping.code,
        name: row.shopping.name,
        value: row.value,
        unit: unit[metric],
        status: row.shopping.status,
        comparable: row.comparable,
        reason: row.reason,
      }));
  },

  async getAlerts(): Promise<Alert[]> {
    const portfolio = await liveDashboardService.getPortfolio();
    return buildCurrentAlerts(portfolio.shoppings);
  },
};
