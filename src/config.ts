export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const API_BASE_URL =
  (import.meta.env.VITE_ANCAR_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://n8n.facilities-ai.com.br/webhook";
