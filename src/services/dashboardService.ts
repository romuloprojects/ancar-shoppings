import { API_BASE_URL } from "@/config";
import type {
  HistoryPeriod,
  LiveShoppingSummary,
  PortfolioApiResponse,
  Shopping,
  ShoppingApiResponse,
} from "@/types";

const STALE_AFTER_MS = 15 * 60 * 1000;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API ANCAR respondeu HTTP ${response.status}.`);
  }

  return (await response.json()) as T;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function liveStatus(item: LiveShoppingSummary): Shopping["status"] {
  if (!item.latest?.collectedAt) return "offline";
  const age = Date.now() - Date.parse(item.latest.collectedAt);
  if (!Number.isFinite(age) || age > STALE_AFTER_MS) return "offline";
  const healthStatus = String(item.latest.health?.status ?? item.latest.qualityStatus ?? "");
  if (healthStatus === "error") return "critico";
  if (healthStatus === "partial") return "atencao";
  if (item.latest.kpis?.balanco_status === "warning") return "atencao";
  return "otimo";
}

export function mapLiveShoppingToLegacy(item: LiveShoppingSummary): Shopping {
  const location = item.metadata?.location ?? {};
  const latest = item.latest;
  const k = latest?.kpis ?? {};
  const health = latest?.health ?? {};
  const total = num(health.pointsTotal) ?? item.registry.pointsTotal ?? 0;
  const ok = num(health.pointsOk) ?? 0;
  const coveragePct = total > 0 ? Math.max(0, Math.min(100, (ok / total) * 100)) : 0;
  const quality = coveragePct >= 99 ? "alta" : coveragePct >= 80 ? "media" : "baixa";

  return {
    id: item.id || item.code.toLowerCase(),
    code: item.code,
    name: item.name,
    state: String(location.state ?? "Não informado"),
    stateCode: String(location.stateCode ?? "--"),
    city: String(location.city ?? "Não informado"),
    latitude: num(location.latitude) ?? 0,
    longitude: num(location.longitude) ?? 0,
    status: liveStatus(item),
    lastUpdate: latest?.collectedAt ?? new Date(0).toISOString(),
    dataQuality: quality,
    dataAvailability: {
      chillers: item.registry.chillersTotal > 0,
      perifericos: k.kw_auxiliares !== null && k.kw_auxiliares !== undefined,
      temperaturas: k.temperatura_externa_c !== null && k.temperatura_externa_c !== undefined,
      vazao: false,
      esg: false,
      coveragePct: Math.round(coveragePct),
    },
    powerKW: num(k.kw_cag) ?? 0,
    consumptionMWh: 0,
    efficiencyKWTR: num(k.kw_tr_eletrico_cag ?? k.kw_tr_cag) ?? 0,
    esgScore: 0,
    copValue: num(k.cop_cag) ?? undefined,
    thermalLoadTR: num(k.tr_total) ?? undefined,
  };
}

export const dashboardService = {
  async getPortfolioLive(): Promise<PortfolioApiResponse> {
    const result = await fetchJson<PortfolioApiResponse>(
      `${API_BASE_URL}/ancar-dashboard-portfolio-v1`,
    );
    if (!result?.ok || !Array.isArray(result.shoppings)) {
      throw new Error("Payload do portfólio ANCAR inválido.");
    }
    return result;
  },

  async getShoppingLive(code: string, period: HistoryPeriod = "24h"): Promise<ShoppingApiResponse> {
    const url = new URL(`${API_BASE_URL}/ancar-dashboard-shopping-v1`);
    url.searchParams.set("shoppingId", code);
    url.searchParams.set("period", period);
    const result = await fetchJson<ShoppingApiResponse>(url.toString());
    if (!result?.ok || !result.shopping) {
      throw new Error(`Shopping ${code} não encontrado na API ANCAR.`);
    }
    result.history = Array.isArray(result.history) ? result.history : [];
    result.equipmentRegistry = Array.isArray(result.equipmentRegistry)
      ? result.equipmentRegistry
      : [];
    return result;
  },

  async getShoppings(): Promise<Shopping[]> {
    const result = await this.getPortfolioLive();
    return result.shoppings.map(mapLiveShoppingToLegacy);
  },
};
