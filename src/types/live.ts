export type LiveQualityStatus = "ok" | "partial" | "error" | string;

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
  kw_tr_chillers?: number | null;
  kw_aux_por_tr?: number | null;
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
  equipamentos?: Record<string, LiveEquipmentKpi>;
  [key: string]: unknown;
}

export interface LiveLatest {
  cycleId: string;
  collectedAt: string;
  qualityStatus: LiveQualityStatus;
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

export interface LiveShoppingSummary {
  id: string;
  code: string;
  name: string;
  timezone: string;
  sortOrder: number;
  metadata: LiveShoppingMetadata;
  registry: LiveRegistrySummary;
  latest: LiveLatest | null;
}

export interface PortfolioApiResponse {
  ok: boolean;
  generatedAt: string;
  refreshIntervalMs: number;
  shoppings: LiveShoppingSummary[];
}

export type HistoryPeriod = "24h" | "7d" | "30d";

export interface ShoppingHistoryPoint {
  timestamp: string;
  kwCag: number | null;
  trTotal: number | null;
  kwTr: number | null;
  cop: number | null;
  temperatureC: number | null;
  kwAux: number | null;
  balanceDeviationPct: number | null;
  dataQualityPct: number | null;
}

export interface EquipmentRegistryItem {
  equipmentKey: string;
  equipmentName: string | null;
  equipmentType: string;
  energySource: string | null;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface ShoppingApiResponse {
  ok: boolean;
  generatedAt: string;
  period: HistoryPeriod;
  shopping: LiveShoppingSummary | null;
  equipmentRegistry: EquipmentRegistryItem[];
  history: ShoppingHistoryPoint[];
}
