import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { readAuthSession, writeAuthSession, type AuthSession } from "@/auth/auth-storage";

interface AuthContextValue {
  session: AuthSession | null;
  checking: boolean;
  login: (username: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    const stored = readAuthSession();
    if (!stored) {
      setChecking(false);
      return;
    }
    authService.me(stored.token)
      .then((me) => {
        if (!alive) return;
        const next: AuthSession = { token: stored.token, ...me };
        writeAuthSession(next);
        setSession(next);
      })
      .catch(() => {
        writeAuthSession(null);
        if (alive) setSession(null);
      })
      .finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const expire = () => {
      writeAuthSession(null);
      setSession(null);
    };
    window.addEventListener("ancar:auth-expired", expire);
    return () => window.removeEventListener("ancar:auth-expired", expire);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const next = await authService.login(username, password);
    writeAuthSession(next);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    const current = session;
    writeAuthSession(null);
    setSession(null);
    if (current?.token) await authService.logout(current.token);
  }, [session]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!session?.token) throw new Error("Sessão inválida.");
    await authService.changePassword(session.token, currentPassword, newPassword);
    writeAuthSession(null);
    setSession(null);
  }, [session]);

  const value = useMemo(() => ({ session, checking, login, logout, changePassword }), [session, checking, login, logout, changePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
