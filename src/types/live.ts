export type LiveQualityStatus = "ok" | "partial" | "error" | string;

export interface ShoppingSettings {
  version: number | null;
  validFrom?: string | null;
  baselineKwTr: number | null;
  targetKwTr: number | null;
  emissionFactorKgCo2Kwh: number | null;
  emissionFactorSource: string | null;
  emissionFactorReferenceYear: number | null;
  balanceWarningPct: number | null;
  peripheralsWarningPct: number | null;
  targetDeviationWarningPct: number | null;
  staleAfterMinutes: number | null;
  baselineReference: string | null;
  baselineValidFrom: string | null;
  baselineNotes: string | null;
  reportSettings: Record<string, unknown>;
  updatedBy?: string | null;
  sourceChannel?: string | null;
}

export interface LiveHealth {
  status?: LiveQualityStatus;
  pointsTotal?: number;
  pointsOk?: number;
  pointsError?: number;
  errorKeys?: string[];
  apiErrorCount?: number;
  collectionDurationSeconds?: number;
  expectedMinimumDelaySeconds?: number;
}

export interface LiveAlertFlags {
  balance?: boolean | null;
  peripherals?: boolean | null;
  target?: boolean | null;
  dataQuality?: boolean | null;
}

export interface LiveEquipmentKpi {
  equipmentType?: string | null;
  energySource?: string | null;
  status?: boolean | null;
  kw?: number | null;
  tr?: number | null;
  kw_tr?: number | null;
  cop?: number | null;
  kw_share_pct?: number | null;
  tr_share_pct?: number | null;
}

export interface LiveKpis {
  modelo_energetico?: string | null;
  chillers_total?: number | null;
  chillers_eletricos?: number | null;
  chillers_absorcao?: number | null;
  kw_cag?: number | null;
  kw_chillers_total?: number | null;
  kw_chillers_eletricos_total?: number | null;
  kw_auxiliares?: number | null;
  kw_cag_calculado?: number | null;
  desvio_balanco_kw?: number | null;
  desvio_balanco_pct?: number | null;
  balanco_status?: string | null;
  tr_total?: number | null;
  kw_tr_cag?: number | null;
  kw_tr_eletrico_cag?: number | null;
  cop_cag?: number | null;
  cop_cag_disponivel?: boolean | null;
  cop_cag_indisponivel_motivo?: string | null;
  auxiliares_pct_kw_cag?: number | null;
  chillers_pct_kw_cag?: number | null;
  chillers_eletricos_pct_kw_cag?: number | null;
  chillers_ativos_por_status?: number | null;
  chillers_status_conhecidos?: number | null;
  chillers_ativos_por_kw?: number | null;
  chillers_ativos?: number | null;
  sistema_cag_ativo_por_kw?: boolean | null;
  sistema_cag_ativo?: boolean | null;
  temperatura_externa_c?: number | null;
  energia_cag_kwh_5min_estimado?: number | null;
  energia_chillers_kwh_5min_estimado?: number | null;
  energia_auxiliares_kwh_5min_estimado?: number | null;
  frio_trh_5min_estimado?: number | null;
  frio_kwh_termico_5min_estimado?: number | null;
  baseline_energia_kwh_5min_estimado?: number | null;
  economia_eletrica_kwh_5min_estimado?: number | null;
  emissoes_evitadas_kgco2_5min_estimado?: number | null;
  desvio_meta_pct?: number | null;
  settings_version?: number | null;
  alert_flags?: LiveAlertFlags;
  equipamentos?: Record<string, LiveEquipmentKpi>;
  [key: string]: unknown;
}

export interface LiveLatest {
  cycleId: string;
  collectedAt: string;
  qualityStatus: LiveQualityStatus;
  settingsVersion?: number | null;
  kpis: LiveKpis;
  status: Record<string, unknown>;
  health: LiveHealth;
}

export interface LiveRegistrySummary {
  chillersTotal: number;
  chillersElectric: number;
  chillersAbsorption: number;
  pointsTotal: number;
}

export interface LiveLocationMetadata {
  city?: string;
  state?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface LiveShoppingMetadata {
  site_type?: string;
  energy_model?: string;
  location?: LiveLocationMetadata;
  [key: string]: unknown;
}

export interface TodaySummary {
  energyKwh: number | null;
  thermalTrh: number | null;
  savedKwh: number | null;
  avoidedKgCo2: number | null;
  avgKwTr: number | null;
}

export interface LiveShoppingSummary {
  id: string;
  code: string;
  name: string;
  timezone: string;
  sortOrder: number;
  collectionIntervalMinutes?: number;
  metadata: LiveShoppingMetadata;
  registry: LiveRegistrySummary;
  settings: ShoppingSettings;
  today?: TodaySummary;
  latest: LiveLatest | null;
}

export interface PortfolioApiResponse {
  ok: boolean;
  generatedAt: string;
  refreshIntervalMs: number;
  shoppings: LiveShoppingSummary[];
}

export type HistoryPeriod = "24h" | "7d" | "30d";
export type AnalysisMetric = "kwCag" | "energyKwh" | "trTotal" | "kwTr" | "kwAux" | "temperatureC" | "dataQualityPct";

export interface ShoppingHistoryPoint {
  timestamp: string;
  kwCag: number | null;
  trTotal: number | null;
  kwTr: number | null;
  cop: number | null;
  temperatureC: number | null;
  kwAux: number | null;
  peripheralsPct: number | null;
  balanceDeviationPct: number | null;
  targetDeviationPct: number | null;
  activeChillers: number | null;
  energyKwh: number | null;
  thermalTrh: number | null;
  savedKwh: number | null;
  avoidedKgCo2: number | null;
  dataQualityPct: number | null;
}

export interface PeriodSummary {
  energyKwh: number | null;
  thermalTrh: number | null;
  savedKwh: number | null;
  avoidedKgCo2: number | null;
  avgKwTr: number | null;
  avgKw: number | null;
  maxKw: number | null;
  avgTr: number | null;
  maxTr: number | null;
  avgAuxKw: number | null;
  avgDataQualityPct: number | null;
}

export interface ComparisonWindowSummary {
  avgKw: number | null;
  avgTr: number | null;
  avgKwTr: number | null;
  avgAuxKw: number | null;
  avgTemperatureC: number | null;
  avgActiveChillers: number | null;
}

export interface PeriodComparison {
  current: ComparisonWindowSummary;
  previous: ComparisonWindowSummary;
}

export interface EquipmentRegistryItem {
  equipmentKey: string;
  equipmentName: string | null;
  equipmentType: string;
  energySource: string | null;
  sortOrder: number;
  metadata: Record<string, unknown>;
}


export interface HistoryDiagnostics {
  historyCount: number;
  historyFrom: string | null;
  historyTo: string | null;
  latestCollectedAt: string | null;
  latestInsideRequestedWindow: boolean;
  historyInconsistent: boolean;
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
  cachedGeneratedAt?: string | null;
}

export interface ShoppingApiResponse {
  ok: boolean;
  generatedAt: string;
  period: HistoryPeriod;
  shopping: LiveShoppingSummary | null;
  equipmentRegistry: EquipmentRegistryItem[];
  history: ShoppingHistoryPoint[];
  summary: PeriodSummary;
  comparison?: PeriodComparison | null;
  historyDiagnostics?: HistoryDiagnostics | null;
}

export interface SettingsApiResponse {
  ok: boolean;
  shoppingId: string;
  settings: ShoppingSettings;
}
