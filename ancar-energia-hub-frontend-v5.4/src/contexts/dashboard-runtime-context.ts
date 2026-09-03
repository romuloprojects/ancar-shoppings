import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AnalysisMetric, HistoryPeriod } from "@/types/live";

export interface DashboardRuntimeValue {
  tick: number;
  lastUpdate: Date;
  refreshNow: () => void;
  selectedShoppingCode: string;
  setSelectedShoppingCode: Dispatch<SetStateAction<string>>;
  historyPeriod: HistoryPeriod;
  setHistoryPeriod: Dispatch<SetStateAction<HistoryPeriod>>;
  comparisonShoppingCodes: string[];
  setComparisonShoppingCodes: Dispatch<SetStateAction<string[]>>;
  comparisonMetric: AnalysisMetric;
  setComparisonMetric: Dispatch<SetStateAction<AnalysisMetric>>;
}

export const DashboardRuntimeContext = createContext<DashboardRuntimeValue | null>(null);

export function useDashboardRuntime() {
  const context = useContext(DashboardRuntimeContext);
  if (!context) {
    throw new Error("useDashboardRuntime deve ser usado dentro de DashboardRuntimeProvider");
  }
  return context;
}
