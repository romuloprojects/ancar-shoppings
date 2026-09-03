import { API_BASE_URL } from "@/config";
import { getAuthToken, signalAuthExpired } from "@/auth/auth-storage";

export interface AvailableReportMonth {
  month: string;
  label: string;
  firstDate: string;
  lastDate: string;
  daysWithData: number;
  sampleCount: number;
  shoppingsWithData?: number;
}

export interface ReportPeriodsResponse {
  ok: boolean;
  generatedAt: string;
  scope?: "shopping" | "portfolio";
  shoppingId: string | null;
  shoppingName: string;
  earliestDataDate: string | null;
  latestDataDate: string | null;
  latestCompleteDate: string | null;
  availableMonths: AvailableReportMonth[];
  maxHistoricalMonths: number;
}

async function authorizedFetch(url: string, init?: RequestInit) {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json, application/pdf", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (response.status === 401) signalAuthExpired();
  return response;
}

function filenameFromResponse(response: Response, fallback: string) {
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1]?.trim() || fallback;
}

export const reportService = {
  async getPeriods(shoppingId = "", scope: "shopping" | "portfolio" = "shopping"): Promise<ReportPeriodsResponse> {
    const qs = scope === "portfolio" ? "scope=portfolio" : `scope=shopping&shoppingId=${encodeURIComponent(shoppingId)}`;
    const response = await authorizedFetch(`${API_BASE_URL}/ancar-report-periods-v1?${qs}`);
    const payload = await response.json().catch(() => null) as (ReportPeriodsResponse & { message?: string }) | null;
    if (!response.ok || !payload?.ok) throw new Error(payload?.message || `Não foi possível consultar os períodos (${response.status}).`);
    return payload;
  },

  async downloadMonthlyPortfolio(month: string) {
    const url = `${API_BASE_URL}/ancar-report-monthly-portfolio-pdf-v1?month=${encodeURIComponent(month)}`;
    const response = await authorizedFetch(url);
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(payload?.message || `Não foi possível gerar o PDF do portfólio (${response.status}).`);
    }
    const blob = await response.blob();
    if (!blob.size) throw new Error("O PDF do portfólio retornou vazio.");
    const fallback = `ANCAR_Portfolio_Mensal_${month}.pdf`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filenameFromResponse(response, fallback);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
  },

  async download(type: "daily" | "weekly" | "monthly", shoppingId: string, anchor: string) {
    const endpoint = type === "daily" ? "ancar-report-daily-pdf-v1" : type === "weekly" ? "ancar-report-weekly-pdf-v1" : "ancar-report-monthly-pdf-v1";
    const parameter = type === "daily" ? "date" : type === "weekly" ? "endDate" : "month";
    const url = `${API_BASE_URL}/${endpoint}?shoppingId=${encodeURIComponent(shoppingId)}&${parameter}=${encodeURIComponent(anchor)}`;
    const response = await authorizedFetch(url);
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(payload?.message || `Não foi possível gerar o PDF (${response.status}).`);
    }
    const blob = await response.blob();
    if (!blob.size) throw new Error("O PDF retornou vazio.");
    const fallback = `ANCAR_${shoppingId}_${type}_${anchor}.pdf`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filenameFromResponse(response, fallback);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
  },
};
