import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, HardHat, UserRound, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { FormError } from '@/components/auth/FormError'
import { cn, safeInternalPath } from '@/lib/utils'

const ROLE_OPTIONS: { role: UserRole; param: string; icon: LucideIcon; label: string; description: string }[] = [
  {
    role: 'candidato',
    param: 'candidato',
    icon: UserRound,
    label: 'Procuro emprego',
    description: 'Monto meu currículo e me candidato a vagas.',
  },
  {
    role: 'autonomo',
    param: 'autonomo',
    icon: HardHat,
    label: 'Sou autônomo',
    description: 'Divulgo meus serviços para ser contratado direto.',
  },
  {
    role: 'empresa_owner',
    param: 'empresa',
    icon: Briefcase,
    label: 'Quero contratar',
    description: 'Publico vagas da minha empresa.',
  },
]

export default function CadastroPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = ROLE_OPTIONS.find((o) => o.param === searchParams.get('perfil'))?.role ?? 'candidato'
  const [role, setRole] = React.useState<UserRole>(initialRole)
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const redirect = safeInternalPath(searchParams.get('redirect'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: signUpError } = await signUp(email, password, role, fullName)
    setLoading(false)
    if (signUpError) {
      setError(signUpError)
      return
    }
    navigate('/cadastro/confirmar')
  }

  return (
    <AuthLayout
      title="Criar conta"
      description="Leva menos de um minuto. Depois você pode adicionar outros perfis."
      footer={
        <>
          Já tem conta?{' '}
          <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Como você vai usar o EmpregaSantana?</legend>
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const active = role === option.role
            return (
              <label
                key={option.role}
                className={cn(
                  'flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                  active ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="perfil"
                  value={option.role}
                  checked={active}
                  onChange={() => setRole(option.role)}
                  className="sr-only"
                />
                <Icon className={cn('size-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                <span className="min-w-0">
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-sm text-muted-foreground">{option.description}</span>
                </span>
              </label>
            )
          })}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{role === 'empresa_owner' ? 'Seu nome (responsável)' : 'Nome completo'}</Label>
          <Input
            id="fullName"
            autoComplete="name"
            autoCapitalize="words"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={6}
            aria-describedby="password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p id="password-hint" className="text-sm text-muted-foreground">
            Mínimo de 6 caracteres.
          </p>
        </div>
        {error && <FormError>{error}</FormError>}
        <Button type="submit" variant="cta" size="lg" disabled={loading}>
          {loading ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
