import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { DashboardRuntimeContext } from "@/contexts/dashboard-runtime-context";
import type { HistoryPeriod } from "@/types/live";

export function DashboardRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useAutoRefresh();
  const [selectedShoppingCode, setSelectedShoppingCode] = useState("BLD");
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>("24h");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ancar:selectedShopping");
      if (saved) setSelectedShoppingCode(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ancar:selectedShopping", selectedShoppingCode);
    } catch {}
  }, [selectedShoppingCode]);

  return (
    <DashboardRuntimeContext.Provider
      value={{
        ...runtime,
        selectedShoppingCode,
        setSelectedShoppingCode,
        historyPeriod,
        setHistoryPeriod,
      }}
    >
      {children}
    </DashboardRuntimeContext.Provider>
  );
}
