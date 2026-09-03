export type ShoppingStatus = "otimo" | "bom" | "atencao" | "critico" | "offline";
export type DataQuality = "alta" | "media" | "baixa";
export type AlertSeverity = "informativo" | "atencao" | "critico";
export type AlertStatus = "novo" | "em_analise" | "reconhecido" | "resolvido";

export interface DataAvailability {
  chillers: boolean;
  perifericos: boolean;
  temperaturas: boolean;
  coveragePct: number;
}

export interface Shopping {
  id: string;
  code: string;
  name: string;
  state: string;
  stateCode: string;
  city: string;
  latitude: number;
  longitude: number;
  status: ShoppingStatus;
  lastUpdate: string;
  dataQuality: DataQuality;
  dataAvailability: DataAvailability;
  powerKW: number | null;
  energyTodayKwh: number | null;
  efficiencyKWTR: number | null;
  thermalLoadTR: number | null;
  peripheralKW: number | null;
  temperatureC: number | null;
  activeChillers: number | null;
  chillersTotal: number;
  dataQualityPct: number;
  savedTodayKwh: number | null;
  avoidedTodayKgCo2: number | null;
  baselineKwTr: number | null;
  targetKwTr: number | null;
  targetChillerKwTr: number | null;
  energyTariffBrlMwh: number | null;
  energyCostTodayBrl: number | null;
  costAboveTargetTodayBrl: number | null;
  costPerTrhTodayBrl: number | null;
  balanceDeviationPct: number | null;
  peripheralsPct: number | null;
}

export interface RankingItem {
  position: number | null;
  shoppingId: string;
  code: string;
  name: string;
  value: number | null;
  unit: string;
  status: ShoppingStatus;
  trend?: number;
  comparable?: boolean;
  targetDeviationPct?: number | null;
  targetKwTr?: number | null;
  reason?: string;
}

export interface Alert {
  id: string;
  shoppingId: string;
  shoppingCode: string;
  shoppingName: string;
  equipment: string;
  severity: AlertSeverity;
  status: AlertStatus;
  date: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface Insight {
  id: string;
  type: "oportunidade" | "alerta" | "destaque";
  icon: "warning" | "settings" | "trend" | "trending-down";
  title: string;
  subtitle: string;
  detail?: string;
}

export type {
  EquipmentRegistryItem,
  AnalysisMetric,
  HistoryPeriod,
  LiveAlertFlags,
  LiveEquipmentKpi,
  LiveHealth,
  LiveKpis,
  LiveLatest,
  LiveLocationMetadata,
  LiveQualityStatus,
  LiveRegistrySummary,
  LiveShoppingMetadata,
  LiveShoppingSummary,
  ComparisonWindowSummary,
  PeriodComparison,
  PeriodSummary,
  PortfolioApiResponse,
  SettingsApiResponse,
  ShoppingApiResponse,
  ShoppingHistoryPoint,
  ShoppingSettings,
  TodaySummary,
} from "./live";
