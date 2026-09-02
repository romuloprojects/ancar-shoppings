import type { ShoppingHistoryPoint, ShoppingSettings } from "@/types/live";

export function tariffBrlKwh(settings?: Partial<ShoppingSettings> | null): number | null {
  const tariff = settings?.energyTariffBrlMwh;
  return typeof tariff === "number" && Number.isFinite(tariff) && tariff >= 0 ? tariff / 1000 : null;
}

export function targetDeviation(current: number | null | undefined, target: number | null | undefined): number | null {
  if (current === null || current === undefined || target === null || target === undefined || !Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;
  return ((current - target) / target) * 100;
}

export function economicsFromTotals(energyKwh: number | null | undefined, thermalTrh: number | null | undefined, settings?: Partial<ShoppingSettings> | null) {
  const tariff = tariffBrlKwh(settings);
  const target = settings?.targetKwTr;
  const energy = typeof energyKwh === "number" && Number.isFinite(energyKwh) ? energyKwh : null;
  const thermal = typeof thermalTrh === "number" && Number.isFinite(thermalTrh) ? thermalTrh : null;
  const validTarget = typeof target === "number" && Number.isFinite(target) && target > 0 ? target : null;
  const energyCostBrl = energy !== null && tariff !== null ? energy * tariff : null;
  const targetEnergyKwh = thermal !== null && validTarget !== null ? thermal * validTarget : null;
  const excessEnergyKwh = energy !== null && targetEnergyKwh !== null ? Math.max(0, energy - targetEnergyKwh) : null;
  const costAboveTargetBrl = excessEnergyKwh !== null && tariff !== null ? excessEnergyKwh * tariff : null;
  const costPerTrhBrl = energyCostBrl !== null && thermal !== null && thermal > 0 ? energyCostBrl / thermal : null;
  return { energyCostBrl, targetEnergyKwh, excessEnergyKwh, costAboveTargetBrl, costPerTrhBrl };
}

export function targetTimePct(history: ShoppingHistoryPoint[], target: number | null | undefined): number | null {
  if (target === null || target === undefined || !Number.isFinite(target) || target <= 0) return null;
  const valid = history.filter((row) => typeof row.kwTr === "number" && Number.isFinite(row.kwTr) && typeof row.trTotal === "number" && row.trTotal > 0);
  if (!valid.length) return null;
  return (valid.filter((row) => (row.kwTr as number) <= target).length / valid.length) * 100;
}

export function chillerOpportunity(kwTr: number | null | undefined, tr: number | null | undefined, settings?: Partial<ShoppingSettings> | null) {
  const target = settings?.targetChillerKwTr;
  const tariff = tariffBrlKwh(settings);
  if (kwTr === null || kwTr === undefined || tr === null || tr === undefined || !Number.isFinite(kwTr) || !Number.isFinite(tr) || typeof target !== "number" || !Number.isFinite(target) || target <= 0) return { deviationPct: null, opportunityKw: null, opportunityBrlH: null };
  const deviationPct = ((kwTr - target) / target) * 100;
  const opportunityKw = Math.max(0, (kwTr - target) * tr);
  return { deviationPct, opportunityKw, opportunityBrlH: tariff !== null ? opportunityKw * tariff : null };
}
