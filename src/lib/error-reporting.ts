type ApplicationErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ApplicationEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ApplicationErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __applicationEvents?: ApplicationEvents;
  }
}

export function reportApplicationError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__applicationEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
