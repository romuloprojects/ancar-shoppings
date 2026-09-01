import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { HistoryPeriod } from "@/types/live";

export interface DashboardRuntimeValue {
  tick: number;
  lastUpdate: Date;
  selectedShoppingCode: string;
  setSelectedShoppingCode: Dispatch<SetStateAction<string>>;
  historyPeriod: HistoryPeriod;
  setHistoryPeriod: Dispatch<SetStateAction<HistoryPeriod>>;
}

export const DashboardRuntimeContext = createContext<DashboardRuntimeValue | null>(null);

export function useDashboardRuntime() {
  const context = useContext(DashboardRuntimeContext);

  if (!context) {
    throw new Error("useDashboardRuntime deve ser usado dentro de DashboardRuntimeProvider");
  }

  return context;
}
