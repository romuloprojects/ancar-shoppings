import { useEffect, useState } from "react";
import { REFRESH_INTERVAL_MS } from "@/config";

export function useAutoRefresh(intervalMs: number = REFRESH_INTERVAL_MS) {
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdate(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return { tick, lastUpdate };
}
