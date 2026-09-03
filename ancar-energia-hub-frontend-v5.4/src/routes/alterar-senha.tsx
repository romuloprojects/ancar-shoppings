import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/alterar-senha")({ head: () => ({ meta: [{ title: "Alterar senha | ANCAR" }] }), component: ChangePasswordPage });

function ChangePasswordPage(){
 const {session,changePassword}=useAuth(); const navigate=useNavigate(); const [currentPassword,setCurrent]=useState("");const [newPassword,setNew]=useState("");const [confirm,setConfirm]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setError("");if(newPassword.length<6){setError("A nova senha deve ter pelo menos 6 caracteres.");return}if(newPassword!==confirm){setError("A confirmação não confere com a nova senha.");return}setLoading(true);try{await changePassword(currentPassword,newPassword);await navigate({to:"/login",replace:true})}catch(err){setError(err instanceof Error?err.message:"Não foi possível alterar a senha.")}finally{setLoading(false)}}
 return <main className="auth-screen auth-change-page"><section className="auth-form-panel"><form className="auth-card auth-card-compact" onSubmit={submit}><img src="/images/logo-ancar-white.png" alt="ANCAR" className="auth-logo auth-logo-small"/><div className="auth-card-head"><div className="auth-icon"><KeyRound/></div><div><span>{session?.mustChangePassword?"Primeiro acesso":"Segurança"}</span><h2>Alterar senha</h2></div></div><p className="auth-help">{session?.mustChangePassword?"Defina sua senha definitiva antes de acessar a plataforma.":"Após a alteração, todas as sessões serão encerradas e um novo login será necessário."}</p>
 <label className="auth-field"><span>Senha atual</span><div><LockKeyhole/><Input type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrent(e.target.value)}/></div></label>
 <label className="auth-field"><span>Nova senha</span><div><LockKeyhole/><Input type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNew(e.target.value)} minLength={6} maxLength={72}/></div></label>
 <label className="auth-field"><span>Confirmar nova senha</span><div><LockKeyhole/><Input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={6} maxLength={72}/></div></label>
 {error&&<div className="auth-error">{error}</div>}<Button className="auth-submit" type="submit" disabled={loading}>{loading?"Salvando...":"Salvar nova senha"}</Button><div className="auth-policy">A nova senha deve ter entre <b>6 e 72 caracteres</b>.</div></form></section></main>
}
