import { createContext, useContext } from "react";

export interface DashboardRuntimeValue {
  tick: number;
  lastUpdate: Date;
}

export const DashboardRuntimeContext = createContext<DashboardRuntimeValue | null>(null);

export function useDashboardRuntime() {
  const context = useContext(DashboardRuntimeContext);

  if (!context) {
    throw new Error("useDashboardRuntime deve ser usado dentro de DashboardRuntimeProvider");
  }

  return context;
}
