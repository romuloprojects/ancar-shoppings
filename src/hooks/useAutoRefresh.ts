import { useCallback, useEffect, useState } from "react";
import { REFRESH_INTERVAL_MS } from "@/config";

export function useAutoRefresh(intervalMs: number = REFRESH_INTERVAL_MS) {
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshNow = useCallback(() => {
    setTick((value) => value + 1);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(refreshNow, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refreshNow]);

  return { tick, lastUpdate, refreshNow, refreshIntervalMs: intervalMs };
}
