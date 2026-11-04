import { registrationDestination, inferRegistrationRole } from '@/lib/authFlow'
import { PhoneInput } from '@/components/fields/MaskedInputs'
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
  const redirect = safeInternalPath(searchParams.get('redirect'))
  const initialRole = ROLE_OPTIONS.find((o) => o.param === searchParams.get('perfil'))?.role ?? inferRegistrationRole(redirect)
  const [role, setRole] = React.useState<UserRole>(initialRole)
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone,setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fullName.trim() || phone.replace(/\D/g,'').length < 10) { setError('Informe seu nome e um telefone válido com DDD.'); return }
    setLoading(true)
    const { error: signUpError } = await signUp(email, password, role, fullName, phone, registrationDestination(role,redirect))
    setLoading(false)
    if (signUpError) {
      setError(signUpError)
      return
    }
    const params=new URLSearchParams({redirect:registrationDestination(role,redirect)})
    navigate(`/cadastro/confirmar?${params}`,{replace:true,state:{email:email.trim(),fromSignup:true}})
  }

  return (
    <AuthLayout
      title="Criar conta"
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
        <fieldset className="grid grid-cols-3 gap-2">
          <legend className="mb-2 text-sm font-medium">Como você vai usar o EmpregaSantana?</legend>
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const active = role === option.role
            return (
              <label
                key={option.role}
                title={option.description}
                className={cn(
                  'flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-card px-2 py-3 text-center text-xs transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
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
                  <span className="block font-medium">{option.label}</span>
                  <span className="sr-only">{option.description}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
        <p className="-mt-3 text-xs text-muted-foreground" aria-live="polite">{ROLE_OPTIONS.find(option => option.role === role)?.description}</p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{role === 'empresa_owner' ? 'Seu nome (responsável)' : 'Nome completo'}</Label>
          <Input
            id="fullName"
            autoComplete="name"
            maxLength={180}
            autoCapitalize="words"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="phone">Telefone com DDD</Label><PhoneInput id="phone" required value={phone} onChange={setPhone} /></div>
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
