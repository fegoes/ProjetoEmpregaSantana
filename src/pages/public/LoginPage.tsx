import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { FormError } from '@/components/auth/FormError'
import { afterLoginPath } from '@/lib/panelNav'
import { safeInternalPath } from '@/lib/utils'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeInternalPath(searchParams.get('redirect'))
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [needsConfirmation,setNeedsConfirmation] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsConfirmation(false)
    const { error: signInError, destination, access } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      setNeedsConfirmation(signInError.includes('Confirme seu e-mail'))
      setError(signInError)
      return
    }
    navigate(afterLoginPath(redirect, destination, access))
  }

  return (
    <AuthLayout
      title="Entrar"
      description={
        redirect?.startsWith('/vagas/')
          ? 'Entre para terminar sua candidatura. Você volta direto para a vaga.'
          : 'Para se candidatar, contratar ou gerenciar suas vagas.'
      }
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to={redirect ? `/cadastro?redirect=${encodeURIComponent(redirect)}` : '/cadastro'} className="font-semibold text-primary hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/esqueci-senha" className="-my-2 py-2 text-sm font-medium text-primary hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <FormError>{error}</FormError>}
        {needsConfirmation&&<Link className="min-h-11 text-sm font-semibold text-primary underline" state={{email:email.trim()}} to={`/cadastro/confirmar${redirect?'?'+new URLSearchParams({redirect}):''}`}>Reenviar o e-mail de confirmação</Link>}
        <Button type="submit" variant="cta" size="lg" className="mt-1" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
