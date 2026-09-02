import type { HistoryPeriod, ShoppingHistoryPoint } from "@/types/live";

const PERIOD_MS: Record<HistoryPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const BUCKET_MS: Record<HistoryPeriod, number> = {
  "24h": 5 * 60 * 1000,
  "7d": 30 * 60 * 1000,
  "30d": 120 * 60 * 1000,
};

export type ChartHistoryPoint = ShoppingHistoryPoint & { chartTimestamp: number };

export function normalizeShoppingHistory(history: ShoppingHistoryPoint[]): ShoppingHistoryPoint[] {
  const byTimestamp = new Map<number, ShoppingHistoryPoint>();
  for (const point of history) {
    const timestamp = Date.parse(point.timestamp);
    if (!Number.isFinite(timestamp)) continue;
    byTimestamp.set(timestamp, { ...point, timestamp: new Date(timestamp).toISOString() });
  }
  return Array.from(byTimestamp.entries())
    .sort(([a], [b]) => a - b)
    .map(([, point]) => point);
}

export function buildChartHistory(
  history: ShoppingHistoryPoint[],
  period: HistoryPeriod,
): ChartHistoryPoint[] {
  const normalized = normalizeShoppingHistory(history);
  if (!normalized.length) return [];

  const result: ChartHistoryPoint[] = [];
  const bucketMs = BUCKET_MS[period];
  let previousTimestamp: number | null = null;

  for (const point of normalized) {
    const timestamp = Date.parse(point.timestamp);
    if (previousTimestamp !== null && timestamp - previousTimestamp > bucketMs * 2.5) {
      const separatorTimestamp = previousTimestamp + bucketMs;
      result.push({
        timestamp: new Date(separatorTimestamp).toISOString(),
        chartTimestamp: separatorTimestamp,
        kwCag: null,
        trTotal: null,
        kwTr: null,
        cop: null,
        temperatureC: null,
        kwAux: null,
        peripheralsPct: null,
        balanceDeviationPct: null,
        targetDeviationPct: null,
        activeChillers: null,
        energyKwh: null,
        thermalTrh: null,
        savedKwh: null,
        avoidedKgCo2: null,
        dataQualityPct: null,
      });
    }
    result.push({ ...point, chartTimestamp: timestamp });
    previousTimestamp = timestamp;
  }

  return result;
}

export function getHistoryTimeDomain(
  period: HistoryPeriod,
  generatedAt?: string | number | Date | null,
): [number, number] {
  const parsed = generatedAt instanceof Date
    ? generatedAt.getTime()
    : typeof generatedAt === "number"
      ? generatedAt
      : generatedAt
        ? Date.parse(generatedAt)
        : Number.NaN;
  const end = Number.isFinite(parsed) ? parsed : Date.now();
  return [end - PERIOD_MS[period], end];
}

export function formatHistoryTick(value: string | number, period: HistoryPeriod) {
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  if (period === "24h") {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  if (period === "7d") {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export function formatHistoryTooltip(value: string | number) {
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("pt-BR");
}

export function historyTickCount(period: HistoryPeriod) {
  if (period === "24h") return 7;
  if (period === "7d") return 8;
  return 7;
}
