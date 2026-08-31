export type ShoppingStatus = "otimo" | "bom" | "atencao" | "critico" | "offline";
export type DataQuality = "alta" | "media" | "baixa";
export type AlertSeverity = "informativo" | "atencao" | "critico";
export type AlertStatus = "novo" | "em_analise" | "reconhecido" | "resolvido";

export interface DataAvailability {
  chillers: boolean;
  perifericos: boolean;
  temperaturas: boolean;
  vazao: boolean;
  esg: boolean;
  coveragePct: number; // 0-100
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
  lastUpdate: string; // ISO
  dataQuality: DataQuality;
  dataAvailability: DataAvailability;
  // métricas atuais
  powerKW: number;
  consumptionMWh: number;
  efficiencyKWTR: number;
  esgScore: number;
  copValue?: number;
  deltaT?: number;
  vazaoLs?: number;
  thermalLoadTR?: number;
  emissionsTons?: number;
  savingsBRL?: number;
  monthlyConsumptionMWh?: number;
}

export interface PortfolioKpi {
  potenciaTotalMW: number;
  consumoHojeMWh: number;
  eficienciaMediaKWTR: number;
  co2EvitadoT: number;
  economiaEstimadaBRL: number;
  deltaPotencia: number;
  deltaConsumo: number;
  deltaEficiencia: number;
  deltaCO2: number;
  deltaEconomia: number;
}

export interface EnergyDataPoint {
  time: string; // label
  eficiencia: number;
  consumo: number;
}

export interface RankingItem {
  position: number;
  shoppingId: string;
  code: string;
  name: string;
  value: number;
  unit: string;
  trend: number; // % vs periodo anterior
  status: ShoppingStatus;
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

export interface ESGMetrics {
  energiaConsumidaMWh: number;
  energiaEconomizadaMWh: number;
  emissoesT: number;
  emissoesEvitadasT: number;
  intensidadeEnergetica: number; // kWh/m²
  esgScore: number;
  ambiental: number;
  social: number;
  governanca: number;
  metaProgressoPct: number;
  energiaRenovavelPct: number;
  aguaM3: number;
  residuosT: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: "chiller" | "torre" | "bomba" | "ahu" | "fancoil" | "outro";
  powerKW: number;
  status: "operando" | "standby" | "manutencao" | "falha";
  efficiencyKWTR?: number;
  lastMaintenance?: string;
}

export interface Insight {
  id: string;
  type: "oportunidade" | "alerta" | "destaque";
  icon: "warning" | "settings" | "trend" | "trending-down";
  title: string;
  subtitle: string;
  detail?: string;
}

export interface ShoppingDetail extends Shopping {
  dailyConsumption: EnergyDataPoint[];
  weeklyConsumption: EnergyDataPoint[];
  monthlyConsumption: EnergyDataPoint[];
  chillerPower: { name: string; kw: number }[];
  peripheralPower: { name: string; kw: number }[];
  temperatures: { name: string; value: number | null; unit: string }[];
  equipments: Equipment[];
  alerts: Alert[];
  insights: Insight[];
}
