import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate(searchParams.get('redirect') ?? '/perfil')
  }

  return (
    <div className="brand-mesh -mx-4 flex justify-center rounded-3xl px-4 py-10 sm:mx-0">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="items-center text-center">
            <span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-brand-ink text-white shadow-sm">
              <Briefcase className="size-5" strokeWidth={2.4} />
            </span>
            <CardTitle className="text-xl">Bem-vindo(a) de volta</CardTitle>
            <CardDescription>Entre para candidatar-se, contratar ou gerenciar suas vagas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="cta" className="mt-1" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/cadastro" className="font-medium text-primary hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
