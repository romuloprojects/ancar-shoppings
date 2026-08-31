import type { ReactNode } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { DashboardRuntimeContext } from "@/contexts/dashboard-runtime-context";

export function DashboardRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useAutoRefresh();

  return (
    <DashboardRuntimeContext.Provider value={runtime}>{children}</DashboardRuntimeContext.Provider>
  );
}
