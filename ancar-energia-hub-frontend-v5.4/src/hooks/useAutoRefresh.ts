import { useCallback, useEffect, useRef, useState } from "react";
import { REFRESH_INTERVAL_MS } from "@/config";

export function useAutoRefresh(intervalMs: number = REFRESH_INTERVAL_MS) {
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const lastRefreshAtRef = useRef(Date.now());

  const refreshNow = useCallback(() => {
    const now = new Date();
    lastRefreshAtRef.current = now.getTime();
    setTick((t) => t + 1);
    setLastUpdate(now);
  }, []);

  useEffect(() => {
    const id = window.setInterval(refreshNow, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAtRef.current >= intervalMs) refreshNow();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, refreshNow]);

  return { tick, lastUpdate, refreshNow };
}
