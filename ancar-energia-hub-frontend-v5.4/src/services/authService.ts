import { API_BASE_URL } from "@/config";
import type { AuthSession, AuthUser } from "@/auth/auth-storage";

interface LoginResponse {
  ok: boolean;
  token?: string;
  expiresAt?: string | null;
  mustChangePassword?: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { ok: false, message: text }; }
}

async function authFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    const response = await authFetch("/ancar-auth-v1/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const payload = (await parseJson(response)) as LoginResponse;
    if (!response.ok || payload.ok === false || !payload.token || !payload.user) {
      throw new Error(payload.message || (response.status === 429 ? "Acesso temporariamente bloqueado." : "Usuário ou senha inválidos."));
    }
    return {
      token: payload.token,
      expiresAt: payload.expiresAt ?? null,
      mustChangePassword: payload.mustChangePassword === true,
      user: payload.user,
    };
  },

  async me(token: string): Promise<Omit<AuthSession, "token">> {
    const response = await authFetch("/ancar-auth-v1/me", { headers: { Authorization: `Bearer ${token}` } });
    const payload = (await parseJson(response)) as LoginResponse;
    if (!response.ok || payload.ok === false || !payload.user) throw new Error(payload.message || "Sessão inválida ou expirada.");
    return {
      expiresAt: payload.expiresAt ?? null,
      mustChangePassword: payload.mustChangePassword === true,
      user: payload.user,
    };
  },

  async logout(token: string) {
    try {
      await authFetch("/ancar-auth-v1/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // O encerramento local sempre prevalece.
    }
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const response = await authFetch("/ancar-auth-v1/change-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = (await parseJson(response)) as LoginResponse;
    if (!response.ok || payload.ok === false) throw new Error(payload.message || "Não foi possível alterar a senha.");
    return payload;
  },
};
