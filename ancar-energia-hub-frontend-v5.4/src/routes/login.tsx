import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ head: () => ({ meta: [{ title: "Acesso | ANCAR" }] }), component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) { setError("Informe usuário e senha."); return; }
    setLoading(true);
    try {
      const session = await login(username.trim(), password);
      await navigate({ to: session.mustChangePassword ? "/alterar-senha" : "/", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally { setLoading(false); }
  }

  return <main className="auth-screen auth-login-page">
    <div className="auth-orbit auth-orbit-one"/><div className="auth-orbit auth-orbit-two"/>
    <section className="auth-brand-panel">
      <img src="/images/logo-ancar-white.png" alt="ANCAR" className="auth-logo"/>
      <div className="auth-brand-copy"><span className="auth-kicker">Hub de Eficiência Energética</span><h1>Inteligência operacional para centrais de água gelada.</h1><p>Monitoramento, eficiência, custos e oportunidades do portfólio ANCAR em uma única visão.</p></div>
      <div className="auth-brand-grid"><div><b>Tempo real</b><span>Atualização silenciosa e contínua</span></div><div><b>Eficiência</b><span>Metas CAG e chillers por shopping</span></div><div><b>Economia</b><span>Energia, custos e oportunidades</span></div></div>
    </section>
    <section className="auth-form-panel"><form className="auth-card" onSubmit={submit}><div className="auth-card-head"><div className="auth-icon"><LockKeyhole/></div><div><span>Acesso seguro</span><h2>Entrar na plataforma</h2></div></div><p className="auth-help">Use suas credenciais ANCAR para acessar os dados do portfólio.</p>
      <label className="auth-field"><span>Usuário</span><div><UserRound/><Input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Seu usuário"/></div></label>
      <label className="auth-field"><span>Senha</span><div><LockKeyhole/><Input autoComplete="current-password" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)} aria-label={show?"Ocultar senha":"Mostrar senha"}>{show?<EyeOff/>:<Eye/>}</button></div></label>
      {error && <div className="auth-error">{error}</div>}
      <Button className="auth-submit" type="submit" disabled={loading}>{loading?"Entrando...":"Entrar"}</Button>
      <div className="auth-policy">Senha mínima: <b>6 caracteres</b> · sessão protegida por 12 horas.</div>
    </form></section>
  </main>;
}
