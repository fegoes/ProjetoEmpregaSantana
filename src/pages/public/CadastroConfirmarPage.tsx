import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormError } from '@/components/auth/FormError'
import { supabase } from '@/lib/supabase'
import { confirmationRedirect } from '@/lib/authFlow'
import { safeInternalPath } from '@/lib/utils'
import { translateAuthError } from '@/lib/authErrors'

export default function CadastroConfirmarPage() {
  const location=useLocation()
  const [params]=useSearchParams()
  const redirect=safeInternalPath(params.get('redirect'))
  const [email,setEmail]=useState<string>(location.state?.email??'')
  const [cooldown,setCooldown]=useState(location.state?.fromSignup?60:0)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [sent,setSent]=useState(false)
  useEffect(()=>{if(cooldown<=0)return;const timer=setTimeout(()=>setCooldown(n=>Math.max(0,n-1)),1000);return ()=>clearTimeout(timer)},[cooldown])
  return <AuthLayout title="Confirme seu e-mail"><div className="space-y-5"><MailCheck className="size-10 text-success-ink" strokeWidth={1.75} />
    <p className="text-[15px]">{location.state?.fromSignup?'Recebemos seu cadastro e solicitamos o envio do link de confirmação.':'Abra a mensagem de confirmação e toque no link para continuar.'} Depois de confirmar, você volta à plataforma para terminar seus dados.</p>
    <p className="text-sm text-muted-foreground">Confira a caixa de entrada, spam e promoções. Se já possui uma conta confirmada, entre com sua senha.</p>
    <form className="space-y-3" onSubmit={async e=>{e.preventDefault();setLoading(true);setError(null);setSent(false);try{const {error}=await supabase.auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:confirmationRedirect(redirect)}});if(error)setError(translateAuthError(error.message));else{setSent(true);setCooldown(60)}}catch{setError('Não foi possível solicitar o envio. Confira a conexão e tente novamente.')}finally{setLoading(false)}}}>
      <Label htmlFor="confirmation-email">E-mail do cadastro</Label><Input id="confirmation-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} />
      {sent&&<p role="status" className="text-sm text-primary">Solicitação enviada. Se houver um cadastro aguardando confirmação nesse endereço, você receberá as instruções.</p>}{error&&<FormError>{error}</FormError>}
      <Button type="submit" variant="outline" disabled={loading||cooldown>0}>{loading?'Solicitando envio…':cooldown>0?`Reenviar em ${cooldown}s`:'Reenviar confirmação'}</Button>
    </form>
    <Button asChild size="lg" variant="cta"><Link to={redirect?`/login?${new URLSearchParams({redirect})}`:'/login'}>Já confirmei: entrar</Link></Button>
  </div></AuthLayout>
}
