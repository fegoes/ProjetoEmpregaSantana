import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/auth/FormError'
import { confirmRegistration } from '@/lib/confirmRegistration'
import { authLandingUrl } from '@/lib/supabase'
import { safeInternalPath } from '@/lib/utils'

export default function AuthConfirmPage() {
  const [params]=useSearchParams()
  const redirect=safeInternalPath(params.get('redirect'))??'/perfil'
  const {user,loading,authError,refreshProfile}=useAuth()
  const attempt=useRef<Promise<{error:string|null}>|null>(null)
  const [result,setResult]=useState<{error:string|null}|null>(null)
  useEffect(()=>{
    let active=true
    if(!attempt.current)attempt.current=confirmRegistration(authLandingUrl??window.location.href)
    void attempt.current.then(value=>{if(active){setResult(value);window.history.replaceState(window.history.state,'',`/auth/confirmar?${new URLSearchParams({redirect})}`)}})
    return ()=>{active=false}
  },[redirect])
  return <AuthLayout title={result?.error?'Não foi possível confirmar':result?'E-mail confirmado':'Confirmando seu e-mail'}>
    {!result?<p role="status">Aguarde enquanto verificamos o link…</p>:result.error?<div className="space-y-4"><FormError>{result.error}</FormError><Button asChild variant="cta"><Link to={`/cadastro/confirmar?${new URLSearchParams({redirect})}`}>Pedir novo link</Link></Button><Button asChild variant="outline"><Link to={`/login?${new URLSearchParams({redirect})}`}>Entrar com e-mail e senha</Link></Button></div>:<div className="space-y-4"><p role="status">Seu e-mail foi confirmado. Continue para completar seus dados e realizar a ação que escolheu.</p>{authError?<><FormError>{authError}</FormError><Button variant="outline" onClick={()=>void refreshProfile()}>Carregar meus dados novamente</Button></>:loading?<p role="status">Preparando seu acesso…</p>:<Button asChild variant="cta"><Link to={user?redirect:`/login?${new URLSearchParams({redirect})}`}>{user?'Continuar cadastro':'Entrar para continuar'}</Link></Button>}</div>}
  </AuthLayout>
}
