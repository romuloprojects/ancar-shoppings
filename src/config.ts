export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const configuredApiBase = (import.meta.env.VITE_ANCAR_API_BASE_URL as string | undefined)?.trim();

export const API_BASE_URL = (configuredApiBase || "https://n8n.facilities-ai.com.br/webhook").replace(
  /\/+$/,
  "",
);
