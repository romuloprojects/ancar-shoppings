import type { HistoryPeriod } from "@/types";

export function getComparisonLabel(period: HistoryPeriod) {
  if (period === "24h") return "vs ontem";
  if (period === "7d") return "vs semana passada";
  return "vs mês anterior";
}

export function percentageChange(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous) || Math.abs(previous) < 1e-9) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function absoluteChange(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return current - previous;
}

export function targetDeviationPct(current?: number | null, target?: number | null) {
  if (current === null || current === undefined || target === null || target === undefined) return null;
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;
  return ((current - target) / target) * 100;
}
