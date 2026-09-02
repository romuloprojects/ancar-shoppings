import { SHOPPING_LOCATIONS } from "@/data/shoppingLocations";
import { API_BASE_URL } from "@/config";
import { normalizeShoppingHistory } from "@/utils/history";
import type { Alert, Shopping } from "@/types";
import type {
  HistoryPeriod,
  LiveShoppingSummary,
  PortfolioApiResponse,
  SettingsApiResponse,
  ShoppingApiResponse,
  ShoppingSettings,
} from "@/types/live";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`API ANCAR respondeu HTTP ${response.status}.`);
  return (await response.json()) as T;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function getDataQualityPct(item: LiveShoppingSummary): number {
  const health = item.latest?.health ?? {};
  const total = asNumber(health.pointsTotal) ?? item.registry.pointsTotal ?? 0;
  const ok = asNumber(health.pointsOk) ?? 0;
  return total > 0 ? Math.max(0, Math.min(100, (ok / total) * 100)) : 0;
}

export function getLiveStatus(item: LiveShoppingSummary): Shopping["status"] {
  if (!item.latest?.collectedAt) return "offline";
  const technicalStaleMinutes = Math.max(5, (item.collectionIntervalMinutes ?? 5) * 3);
  const age = Date.now() - Date.parse(item.latest.collectedAt);
  if (!Number.isFinite(age) || age > technicalStaleMinutes * 60_000) return "offline";
  const healthStatus = String(item.latest.health?.status ?? item.latest.qualityStatus ?? "");
  if (healthStatus === "error") return "critico";
  if (healthStatus === "partial") return "atencao";
  const kpis = item.latest.kpis ?? {};
  const settings = item.settings ?? normalizeSettings();
  const balance = asNumber(kpis.desvio_balanco_pct);
  const peripherals = asNumber(kpis.auxiliares_pct_kw_cag);
  const kwTr = asNumber(kpis.kw_tr_eletrico_cag ?? kpis.kw_tr_cag);
  const targetDeviation = kwTr !== null && settings.targetKwTr !== null && settings.targetKwTr > 0
    ? ((kwTr - settings.targetKwTr) / settings.targetKwTr) * 100
    : null;
  if (settings.balanceWarningPct !== null && balance !== null && balance > settings.balanceWarningPct) return "atencao";
  if (settings.peripheralsWarningPct !== null && peripherals !== null && peripherals > settings.peripheralsWarningPct) return "atencao";
  if (settings.targetDeviationWarningPct !== null && targetDeviation !== null && targetDeviation > settings.targetDeviationWarningPct) return "atencao";
  return "otimo";
}

export function mapLiveShoppingToLegacy(item: LiveShoppingSummary): Shopping {
  const location = item.metadata?.location ?? {};
  const masterLocation = SHOPPING_LOCATIONS[item.code];
  const kpis = item.latest?.kpis ?? {};
  const coveragePct = getDataQualityPct(item);
  const quality = coveragePct >= 99 ? "alta" : coveragePct >= 80 ? "media" : "baixa";
  const powerKW = asNumber(kpis.kw_cag);
  const thermalLoadTR = asNumber(kpis.tr_total);
  const directKwTr = asNumber(kpis.kw_tr_eletrico_cag ?? kpis.kw_tr_cag);
  const efficiencyKWTR = directKwTr ?? (powerKW !== null && thermalLoadTR !== null && thermalLoadTR > 0 ? powerKW / thermalLoadTR : null);
  return {
    id: item.id || item.code.toLowerCase(),
    code: item.code,
    name: item.name,
    state: String(masterLocation?.state ?? location.state ?? "Não informado"),
    stateCode: String(masterLocation?.stateCode ?? location.stateCode ?? "--"),
    city: String(masterLocation?.city ?? location.city ?? "Não informado"),
    latitude: masterLocation?.latitude ?? asNumber(location.latitude) ?? 0,
    longitude: masterLocation?.longitude ?? asNumber(location.longitude) ?? 0,
    status: getLiveStatus(item),
    lastUpdate: item.latest?.collectedAt ?? new Date(0).toISOString(),
    dataQuality: quality,
    dataAvailability: {
      chillers: item.registry.chillersTotal > 0,
      perifericos: asNumber(kpis.kw_auxiliares) !== null,
      temperaturas: asNumber(kpis.temperatura_externa_c) !== null,
      coveragePct: Math.round(coveragePct),
    },
    powerKW,
    energyTodayKwh: asNumber(item.today?.energyKwh),
    efficiencyKWTR,
    thermalLoadTR,
    peripheralKW: asNumber(kpis.kw_auxiliares),
    temperatureC: asNumber(kpis.temperatura_externa_c),
    activeChillers: asNumber(kpis.chillers_ativos),
    chillersTotal: item.registry.chillersTotal,
    dataQualityPct: coveragePct,
    savedTodayKwh: asNumber(item.today?.savedKwh),
    avoidedTodayKgCo2: asNumber(item.today?.avoidedKgCo2),
    baselineKwTr: asNumber(item.settings?.baselineKwTr),
    targetKwTr: asNumber(item.settings?.targetKwTr),
    balanceDeviationPct: asNumber(kpis.desvio_balanco_pct),
    peripheralsPct: asNumber(kpis.auxiliares_pct_kw_cag),
  };
}

export function buildCurrentAlerts(items: LiveShoppingSummary[]): Alert[] {
  const alerts: Alert[] = [];
  for (const item of items) {
    const latest = item.latest;
    if (!latest) {
      alerts.push(makeAlert(item, "sem-dados", "critico", "Sem dados da CAG", "Ainda não há telemetria disponível para esta unidade.", "Verifique a coleta WebCTRL e o cadastro de pontos."));
      continue;
    }
    const date = latest.collectedAt;
    const settings = item.settings ?? ({} as ShoppingSettings);
    const ageMinutes = (Date.now() - Date.parse(date)) / 60_000;
    if (settings.staleAfterMinutes && ageMinutes > settings.staleAfterMinutes) {
      alerts.push(makeAlert(item, "stale", "critico", "Dados desatualizados", `Última atualização há ${Math.round(ageMinutes)} minutos; limite configurado: ${settings.staleAfterMinutes} min.`, "Verifique comunicação, n8n e WebCTRL.", date));
    }
    const healthStatus = String(latest.health?.status ?? latest.qualityStatus ?? "");
    if (healthStatus === "partial" || healthStatus === "error") {
      alerts.push(makeAlert(item, "qualidade", healthStatus === "error" ? "critico" : "atencao", "Qualidade de dados reduzida", `${latest.health?.pointsOk ?? 0} de ${latest.health?.pointsTotal ?? item.registry.pointsTotal} pontos válidos no último ciclo.`, "Verifique os pontos indicados na qualidade da aquisição.", date));
    }
    const balance = asNumber(latest.kpis?.desvio_balanco_pct);
    if (settings.balanceWarningPct !== null && balance !== null && balance > settings.balanceWarningPct) alerts.push(makeAlert(item, "balanco", "atencao", "Desvio de balanço elétrico", `Desvio atual de ${fmt(balance)}% acima do limite configurado de ${fmt(settings.balanceWarningPct)}%.`, "Conferir medições de potência da CAG, chillers e periféricos.", date));
    const peripherals = asNumber(latest.kpis?.auxiliares_pct_kw_cag);
    if (settings.peripheralsWarningPct !== null && peripherals !== null && peripherals > settings.peripheralsWarningPct) alerts.push(makeAlert(item, "perifericos", "atencao", "Periféricos acima do limite", `Periféricos representam ${fmt(peripherals)}% da potência da CAG; limite configurado: ${fmt(settings.peripheralsWarningPct)}%.`, "Avaliar bombas, torres e demais cargas periféricas em operação.", date));
    const kwTr = asNumber(latest.kpis?.kw_tr_eletrico_cag ?? latest.kpis?.kw_tr_cag);
    const targetDeviation = kwTr !== null && settings.targetKwTr !== null && settings.targetKwTr > 0 ? ((kwTr - settings.targetKwTr) / settings.targetKwTr) * 100 : null;
    if (settings.targetDeviationWarningPct !== null && targetDeviation !== null && targetDeviation > settings.targetDeviationWarningPct) alerts.push(makeAlert(item, "meta", "atencao", "Desempenho acima da meta", `Valor atual de ${fmt(kwTr, 2)} kW/TR acima da tolerância configurada para a meta.`, "Avaliar a condição operacional e a distribuição de carga entre chillers.", date));
  }
  return alerts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

function fmt(v: number | null | undefined, digits = 1) {
  return v === null || v === undefined ? "—" : v.toFixed(digits).replace(".", ",");
}
function makeAlert(item: LiveShoppingSummary, suffix: string, severity: Alert["severity"], title: string, description: string, recommendation: string, date = new Date().toISOString()): Alert {
  return { id: `${item.code}-${suffix}`, shoppingId: item.id, shoppingCode: item.code, shoppingName: item.name, equipment: "CAG", severity, status: "novo", date, title, description, recommendation };
}

export const liveDashboardService = {
  async getPortfolio(): Promise<PortfolioApiResponse> {
    const result = await requestJson<PortfolioApiResponse>(`${API_BASE_URL}/ancar-dashboard-portfolio-v1`);
    if (!result?.ok || !Array.isArray(result.shoppings)) throw new Error("Payload do portfólio ANCAR inválido.");
    result.shoppings = result.shoppings.map((s) => ({ ...s, settings: normalizeSettings(s.settings), today: s.today ?? { energyKwh: null, thermalTrh: null, savedKwh: null, avoidedKgCo2: null, avgKwTr: null } }));
    return result;
  },

  async getShopping(code: string, period: HistoryPeriod = "24h"): Promise<ShoppingApiResponse> {
    const url = new URL(`${API_BASE_URL}/ancar-dashboard-shopping-v1`);
    url.searchParams.set("shoppingId", code);
    url.searchParams.set("period", period);
    const result = await requestJson<ShoppingApiResponse>(url.toString());
    if (!result?.ok || !result.shopping) throw new Error(`Shopping ${code} não encontrado na API ANCAR.`);
    result.shopping.settings = normalizeSettings(result.shopping.settings);
    result.history = normalizeShoppingHistory(Array.isArray(result.history) ? result.history : []);
    result.equipmentRegistry = Array.isArray(result.equipmentRegistry) ? result.equipmentRegistry : [];
    result.summary = result.summary ?? { energyKwh: null, thermalTrh: null, savedKwh: null, avoidedKgCo2: null, avgKwTr: null, avgKw: null, maxKw: null, avgTr: null, maxTr: null, avgAuxKw: null, avgDataQualityPct: null };
    return result;
  },

  async getShoppings(): Promise<Shopping[]> {
    const result = await this.getPortfolio();
    return result.shoppings.map(mapLiveShoppingToLegacy);
  },

  async getSettings(code: string): Promise<SettingsApiResponse> {
    const url = new URL(`${API_BASE_URL}/ancar-settings-v1`);
    url.searchParams.set("shoppingId", code);
    const result = await requestJson<SettingsApiResponse>(url.toString());
    if (!result?.ok) throw new Error(`Não foi possível carregar as configurações de ${code}.`);
    result.settings = normalizeSettings(result.settings);
    return result;
  },

  async saveSettings(code: string, settings: ShoppingSettings): Promise<SettingsApiResponse> {
    const result = await requestJson<SettingsApiResponse>(`${API_BASE_URL}/ancar-settings-v1`, {
      method: "PUT",
      body: JSON.stringify({ shoppingId: code, ...settings, updatedBy: "frontend" }),
    });
    if (!result?.ok) throw new Error(`Não foi possível salvar as configurações de ${code}.`);
    result.settings = normalizeSettings(result.settings);
    return result;
  },
};

export function normalizeSettings(input?: Partial<ShoppingSettings> | null): ShoppingSettings {
  return {
    version: asNumber(input?.version),
    validFrom: input?.validFrom ?? null,
    baselineKwTr: asNumber(input?.baselineKwTr),
    targetKwTr: asNumber(input?.targetKwTr),
    emissionFactorKgCo2Kwh: asNumber(input?.emissionFactorKgCo2Kwh),
    emissionFactorSource: input?.emissionFactorSource ?? null,
    emissionFactorReferenceYear: asNumber(input?.emissionFactorReferenceYear),
    balanceWarningPct: asNumber(input?.balanceWarningPct),
    peripheralsWarningPct: asNumber(input?.peripheralsWarningPct),
    targetDeviationWarningPct: asNumber(input?.targetDeviationWarningPct),
    staleAfterMinutes: asNumber(input?.staleAfterMinutes),
    baselineReference: input?.baselineReference ?? null,
    baselineValidFrom: input?.baselineValidFrom ?? null,
    baselineNotes: input?.baselineNotes ?? null,
    reportSettings: input?.reportSettings && typeof input.reportSettings === "object" ? input.reportSettings : {},
    updatedBy: input?.updatedBy ?? null,
    sourceChannel: input?.sourceChannel ?? null,
  };
}
