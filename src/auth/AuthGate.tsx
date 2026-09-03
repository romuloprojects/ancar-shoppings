import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";

const LOGIN_ROUTE = "/login";
const CHANGE_PASSWORD_ROUTE = "/alterar-senha";

function AuthLoading() {
  return <div className="auth-screen auth-loading"><img src="/images/logo-ancar-white.png" alt="ANCAR"/><LoaderCircle className="h-5 w-5 animate-spin text-[var(--accent-cyan)]"/><span>Validando acesso...</span></div>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, checking } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (checking) return;
    if (!session && pathname !== LOGIN_ROUTE) void navigate({ to: LOGIN_ROUTE, replace: true });
    else if (session?.mustChangePassword && pathname !== CHANGE_PASSWORD_ROUTE) void navigate({ to: CHANGE_PASSWORD_ROUTE, replace: true });
    else if (session && !session.mustChangePassword && pathname === LOGIN_ROUTE) void navigate({ to: "/", replace: true });
  }, [checking, session, pathname, navigate]);

  if (checking) return <AuthLoading />;
  if (!session) return pathname === LOGIN_ROUTE ? <>{children}</> : <AuthLoading />;
  if (session.mustChangePassword) return pathname === CHANGE_PASSWORD_ROUTE ? <>{children}</> : <AuthLoading />;
  if (pathname === LOGIN_ROUTE) return <AuthLoading />;
  if (pathname === CHANGE_PASSWORD_ROUTE) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
}
