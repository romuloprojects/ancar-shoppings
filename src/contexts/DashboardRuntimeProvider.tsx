import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { DashboardRuntimeContext } from "@/contexts/dashboard-runtime-context";
import type { AnalysisMetric, HistoryPeriod } from "@/types/live";

export function DashboardRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useAutoRefresh();
  const [selectedShoppingCode, setSelectedShoppingCode] = useState("");
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>("24h");
  const [comparisonShoppingCodes, setComparisonShoppingCodes] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<AnalysisMetric>("kwCag");

  useEffect(() => {
    try {
      const savedShopping = window.localStorage.getItem("ancar:selectedShopping");
      const savedPeriod = window.localStorage.getItem("ancar:historyPeriod") as HistoryPeriod | null;
      const savedComparison = window.localStorage.getItem("ancar:comparisonShoppings");
      const savedMetric = window.localStorage.getItem("ancar:comparisonMetric") as AnalysisMetric | null;
      if (savedShopping) setSelectedShoppingCode(savedShopping);
      if (savedPeriod && ["24h", "7d", "30d"].includes(savedPeriod)) setHistoryPeriod(savedPeriod);
      if (savedComparison) {
        const parsed = JSON.parse(savedComparison);
        if (Array.isArray(parsed)) setComparisonShoppingCodes(parsed.filter((item) => typeof item === "string"));
      }
      if (savedMetric) setComparisonMetric(savedMetric);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (selectedShoppingCode) window.localStorage.setItem("ancar:selectedShopping", selectedShoppingCode);
      window.localStorage.setItem("ancar:historyPeriod", historyPeriod);
      window.localStorage.setItem("ancar:comparisonShoppings", JSON.stringify(comparisonShoppingCodes));
      window.localStorage.setItem("ancar:comparisonMetric", comparisonMetric);
    } catch {}
  }, [selectedShoppingCode, historyPeriod, comparisonShoppingCodes, comparisonMetric]);

  return (
    <DashboardRuntimeContext.Provider
      value={{
        ...runtime,
        selectedShoppingCode,
        setSelectedShoppingCode,
        historyPeriod,
        setHistoryPeriod,
        comparisonShoppingCodes,
        setComparisonShoppingCodes,
        comparisonMetric,
        setComparisonMetric,
      }}
    >
      {children}
    </DashboardRuntimeContext.Provider>
  );
}
