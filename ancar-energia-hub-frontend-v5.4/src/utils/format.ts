export const formatNumber = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("pt-BR", opts).format(n);

export const formatKwTr = (value: number | null | undefined, fallback = "—") =>
  value === null || value === undefined || !Number.isFinite(value)
    ? fallback
    : formatNumber(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export const formatMetric = (
  value: number | null | undefined,
  unit?: string,
  digits = 1,
  fallback = "—",
) => {
  if (unit === "kW/TR") return formatKwTr(value, fallback);
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  return formatNumber(value, { maximumFractionDigits: digits });
};

export const formatBRL2 = (value: number | null | undefined, fallback = "—") =>
  value === null || value === undefined || !Number.isFinite(value)
    ? fallback
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso),
  );

export const formatRelative = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `há ${Math.max(0, diff)}s`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
};

export const statusLabel = (s: string) =>
  ({ otimo: "Ótimo", bom: "Bom", atencao: "Atenção", critico: "Crítico", offline: "Offline" })[s] ??
  s;

export const severityLabel = (s: string) =>
  ({ informativo: "Informativo", atencao: "Atenção", critico: "Crítico" })[s] ?? s;

export const alertStatusLabel = (s: string) =>
  ({ novo: "Novo", em_analise: "Em análise", reconhecido: "Reconhecido", resolvido: "Resolvido" })[
    s
  ] ?? s;
