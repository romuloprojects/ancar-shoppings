export const ANCAR_AUTH_STORAGE_KEY = "ancar-access-session-v1";

export interface AuthUser {
  id: number | string;
  username: string;
  displayName: string;
  role: "ADMIN" | "VIEWER" | string;
}

export interface AuthSession {
  token: string;
  expiresAt: string | null;
  mustChangePassword: boolean;
  user: AuthUser;
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ANCAR_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AuthSession;
    if (!value?.token || !value?.user?.username) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) window.sessionStorage.removeItem(ANCAR_AUTH_STORAGE_KEY);
  else window.sessionStorage.setItem(ANCAR_AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthToken(): string | null {
  return readAuthSession()?.token ?? null;
}

export function signalAuthExpired() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ancar:auth-expired"));
}
