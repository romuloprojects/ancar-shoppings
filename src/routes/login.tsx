import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Acesso | ancar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Informe usuário e senha.");
      return;
    }
    setLoading(true);
    try {
      const session = await login(username.trim(), password);
      await navigate({ to: session.mustChangePassword ? "/alterar-senha" : "/", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen login-v56">
      <section className="login-v56-hero" aria-label="Plataforma de Gestão ANCAR">
        <div className="login-v56-hero-shade" />
        <div className="login-v56-hero-content">
          <header className="login-v56-hero-header">
            <img src="/images/logo-ancar-symbol.png" alt="" className="login-v56-symbol" />
            <span className="login-v56-kicker">Plataforma de Gestão ANCAR</span>
          </header>

          <div className="login-v56-copy">
            <h1>
              Gestão inteligente<br />
              para o portfólio <em>ANCAR</em>
            </h1>
            <span className="login-v56-accent-line" />
            <p>
              Visão consolidada dos shoppings para decisões estratégicas que impulsionam operação,
              performance e sustentabilidade.
            </p>
          </div>

          <div className="login-v56-insights" aria-hidden="true">
            <div className="login-v56-insight">
              <span>Performance do portfólio</span>
              <strong>Visão multi-site</strong>
              <div className="login-v56-bars">
                <i /><i /><i /><i /><i />
              </div>
              <small>Indicadores operacionais e econômicos</small>
            </div>
            <div className="login-v56-insight">
              <span>Sustentabilidade</span>
              <strong>Energia & emissões</strong>
              <div className="login-v56-ring"><i /></div>
              <small>Eficiência, metas e impacto ambiental</small>
            </div>
          </div>

          <div className="login-v56-feature-grid">
            <div className="login-v56-feature">
              <span className="login-v56-feature-icon"><Building2 /></span>
              <div><b>Portfólio</b><small>Visão integrada dos ativos e indicadores em um só lugar.</small></div>
            </div>
            <div className="login-v56-feature">
              <span className="login-v56-feature-icon"><BarChart3 /></span>
              <div><b>Performance</b><small>Acompanhamento contínuo para decisões mais assertivas.</small></div>
            </div>
            <div className="login-v56-feature">
              <span className="login-v56-feature-icon"><Leaf /></span>
              <div><b>Sustentabilidade</b><small>Eficiência energética e gestão de emissões do portfólio.</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-v56-access">
        <div className="login-v56-access-decoration login-v56-access-decoration-top" aria-hidden="true" />
        <div className="login-v56-access-decoration login-v56-access-decoration-bottom" aria-hidden="true" />

        <div className="login-v56-access-shell">
          <form className="login-v56-card" onSubmit={submit}>
            <div className="login-v56-brand-block">
              <img src="/images/logo-ancar-v56.png" alt="ancar" className="login-v56-brand" />
              <span>Plataforma de Gestão</span>
            </div>

            <div className="login-v56-heading">
              <h2>Bem-vindo ao Dashboard ANCAR</h2>
              <p>Acesse os indicadores de performance, sustentabilidade e gestão do portfólio de shoppings.</p>
            </div>

            <label className="login-v56-field">
              <span>Usuário</span>
              <div>
                <UserRound />
                <Input
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                />
              </div>
            </label>

            <label className="login-v56-field">
              <span>Senha</span>
              <div>
                <LockKeyhole />
                <Input
                  autoComplete="current-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="login-v56-eye"
                  onClick={() => setShow(v => !v)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            {error && <div className="auth-error login-v56-error">{error}</div>}

            <Button className="login-v56-submit" type="submit" disabled={loading}>
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              {!loading && <ArrowRight />}
            </Button>

            <div className="login-v56-security">
              <ShieldCheck />
              <span>Sessão segura <i>•</i> 12 horas</span>
            </div>
          </form>

          <footer className="login-v56-footer">
            <span>Ambiente protegido para usuários autorizados</span>
            <b>Versão 5.6</b>
          </footer>
        </div>
      </section>
    </main>
  );
}
