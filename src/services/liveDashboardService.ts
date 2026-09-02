import { SHOPPING_LOCATIONS } from "@/data/shoppingLocations";
import { API_BASE_URL } from "@/config";
import { normalizeShoppingHistory } from "@/utils/history";
import type { Alert, Shopping } from "@/types";
import type {
  ComparisonWindowSummary,
  HistoryPeriod,
  HistoryDiagnostics,
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


const HISTORY_WINDOW_MS: Record<HistoryPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

// Último histórico válido da sessão, isolado por shopping + período.
// Serve apenas como proteção contra respostas transitórias vazias do polling.
const shoppingHistoryCache = new Map<string, ShoppingApiResponse>();

function historyCacheKey(code: string, period: HistoryPeriod) {
  return `${code.trim().toUpperCase()}:${period}`;
}

function buildLocalHistoryDiagnostics(result: ShoppingApiResponse, period: HistoryPeriod): HistoryDiagnostics {
  const timestamps = result.history
    .map((point) => Date.parse(point.timestamp))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const latestCollectedAt = result.shopping?.latest?.collectedAt ?? null;
  const latestTs = latestCollectedAt ? Date.parse(latestCollectedAt) : Number.NaN;
  const generatedTs = Date.parse(result.generatedAt);
  const windowEnd = Number.isFinite(generatedTs) ? generatedTs : Date.now();
  const latestInsideRequestedWindow = Number.isFinite(latestTs) && latestTs >= windowEnd - HISTORY_WINDOW_MS[period] && latestTs <= windowEnd + 60_000;
  return {
    historyCount: timestamps.length,
    historyFrom: timestamps.length ? new Date(timestamps[0]).toISOString() : null,
    historyTo: timestamps.length ? new Date(timestamps[timestamps.length - 1]).toISOString() : null,
    latestCollectedAt,
    latestInsideRequestedWindow,
    historyInconsistent: latestInsideRequestedWindow && timestamps.length === 0,
  };
}

function normalizeComparisonWindow(input?: Partial<ComparisonWindowSummary> | null): ComparisonWindowSummary {
  return {
    avgKw: asNumber(input?.avgKw),
    avgTr: asNumber(input?.avgTr),
    avgKwTr: asNumber(input?.avgKwTr),
    avgAuxKw: asNumber(input?.avgAuxKw),
    avgTemperatureC: asNumber(input?.avgTemperatureC),
    avgActiveChillers: asNumber(input?.avgActiveChillers),
  };
}

export function getDataQualityPct(item: LiveShoppingSummary): number {
  const health = item.latest?.health ?? {};
  const total = asNumber(health.pointsTotal) ?? item.registry.pointsTotal ?? 0;
  const ok = asNumber(health.pointsOk) ?? 0;
  return total > 0 ? Math.max(0, Math.min(100, (ok / total) * 100)) : 0;
}

export type PortfolioSystemStatusKind = "operational" | "attention" | "degraded";

export interface PortfolioSystemStatus {
  kind: PortfolioSystemStatusKind;
  label: string;
  fallbackCount: number;
  partialCount: number;
  criticalMissingCount: number;
  offlineCount: number;
}

function latestAgeMinutes(item: LiveShoppingSummary): number | null {
  if (!item.latest?.collectedAt) return null;
  const ts = Date.parse(item.latest.collectedAt);
  return Number.isFinite(ts) ? Math.max(0, (Date.now() - ts) / 60_000) : null;
}

function hasFallbackValue(item: LiveShoppingSummary): boolean {
  return Object.values(item.latest?.valueFreshness ?? {}).some((value) => value?.fallback === true);
}

function hasCriticalValueExpired(item: LiveShoppingSummary): boolean {
  const freshness = item.latest?.valueFreshness;
  if (!freshness) return false;
  return freshness.kw_cag?.valid === false || freshness.tr_total?.valid === false;
}

export function getPortfolioSystemStatus(items: LiveShoppingSummary[]): PortfolioSystemStatus {
  let fallbackCount = 0;
  let partialCount = 0;
  let criticalMissingCount = 0;
  let offlineCount = 0;
  for (const item of items) {
    const ageMinutes = latestAgeMinutes(item);
    const technicalLimit = Math.max(10, (item.collectionIntervalMinutes ?? 3) * 3);
    if (ageMinutes === null || ageMinutes > technicalLimit) offlineCount += 1;
    if (hasCriticalValueExpired(item)) criticalMissingCount += 1;
    if (hasFallbackValue(item)) fallbackCount += 1;
    const health = String(item.latest?.health?.status ?? item.latest?.qualityStatus ?? "");
    if (health === "partial" || health === "error") partialCount += 1;
  }
  if (offlineCount > 0 || criticalMissingCount > 0) {
    return { kind: "degraded", label: "Comunicação degradada", fallbackCount, partialCount, criticalMissingCount, offlineCount };
  }
  if (fallbackCount > 0 || partialCount > 0) {
    return { kind: "attention", label: "Sistema com atenção", fallbackCount, partialCount, criticalMissingCount, offlineCount };
  }
  return { kind: "operational", label: "Sistema Operacional", fallbackCount, partialCount, criticalMissingCount, offlineCount };
}

export function getLiveStatus(item: LiveShoppingSummary): Shopping["status"] {
  if (!item.latest?.collectedAt) return "offline";
  const technicalStaleMinutes = Math.max(10, (item.collectionIntervalMinutes ?? 3) * 3);
  const age = Date.now() - Date.parse(item.latest.collectedAt);
  if (!Number.isFinite(age) || age > technicalStaleMinutes * 60_000) return "offline";
  if (hasCriticalValueExpired(item)) return "critico";
  const healthStatus = String(item.latest.health?.status ?? item.latest.qualityStatus ?? "");
  if (hasFallbackValue(item)) return "atencao";
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
    result.comparison = result.comparison ? {
      current: normalizeComparisonWindow(result.comparison.current),
      previous: normalizeComparisonWindow(result.comparison.previous),
    } : null;

    const key = historyCacheKey(code, period);
    const localDiagnostics = buildLocalHistoryDiagnostics(result, period);
    result.historyDiagnostics = {
      ...localDiagnostics,
      ...(result.historyDiagnostics ?? {}),
      historyCount: result.history.length,
    };

    if (result.history.length > 0) {
      shoppingHistoryCache.set(key, result);
      return result;
    }

    const cached = shoppingHistoryCache.get(key);
    if (cached?.history?.length) {
      // Uma resposta vazia do polling não pode apagar um gráfico já válido.
      // Preservamos apenas os campos históricos; latest/health continuam vindo da resposta nova.
      result.history = cached.history;
      result.summary = cached.summary;
      result.historyDiagnostics = {
        ...(result.historyDiagnostics ?? localDiagnostics),
        historyCount: cached.history.length,
        historyFrom: cached.historyDiagnostics?.historyFrom ?? cached.history[0]?.timestamp ?? null,
        historyTo: cached.historyDiagnostics?.historyTo ?? cached.history[cached.history.length - 1]?.timestamp ?? null,
        fallbackUsed: true,
        fallbackReason: "empty_history_response",
        cachedGeneratedAt: cached.generatedAt,
      };
      return result;
    }

    if (result.historyDiagnostics?.historyInconsistent) {
      throw new Error(`API ANCAR retornou histórico vazio inconsistente para ${code} (${period}), apesar de existir coleta recente.`);
    }

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
