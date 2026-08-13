import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, GraduationCap, HardHat, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS: { role: UserRole; icon: LucideIcon; label: string; description: string }[] = [
  {
    role: 'candidato',
    icon: GraduationCap,
    label: 'Sou candidato',
    description: 'Quero montar meu currículo e me candidatar a vagas.',
  },
  {
    role: 'autonomo',
    icon: HardHat,
    label: 'Sou autônomo',
    description: 'Quero divulgar meus serviços para contratação direta.',
  },
  {
    role: 'empresa_owner',
    icon: Briefcase,
    label: 'Sou empresa',
    description: 'Quero publicar vagas e contratar.',
  },
]

export default function CadastroPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = React.useState<UserRole>('candidato')
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

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
    <div className="brand-mesh -mx-4 flex justify-center rounded-3xl px-4 py-10 sm:mx-0">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl">Criar conta</CardTitle>
            <CardDescription>Leva menos de um minuto. Você pode adicionar outros perfis depois.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid gap-2">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isActive = role === option.role
                return (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => setRole(option.role)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all',
                      isActive
                        ? 'border-primary bg-primary/8 ring-1 ring-primary'
                        : 'border-border hover:border-primary/40 hover:bg-accent',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="cta" className="mt-1" disabled={loading}>
                {loading ? 'Criando conta…' : 'Criar conta'}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
