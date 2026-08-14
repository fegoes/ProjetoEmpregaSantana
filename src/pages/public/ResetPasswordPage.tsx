import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/brand/Logo'

export default function ResetPasswordPage() {
  const { user, loading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    const { error: updateError } = await updatePassword(password)
    setLoading(false)
    if (updateError) {
      setError(updateError)
      return
    }
    setDone(true)
    setTimeout(() => navigate('/perfil'), 1500)
  }

  return (
    <div className="brand-mesh -mx-4 flex justify-center rounded-3xl px-4 py-10 sm:mx-0">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="items-center text-center">
            <Logo variant="mark" size="lg" asLink={false} className="mb-1" />
            <CardTitle className="text-xl">Definir nova senha</CardTitle>
            <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            {authLoading ? (
              <p className="text-sm text-muted-foreground">Verificando link…</p>
            ) : !user ? (
              <p className="text-sm text-destructive">
                Este link de redefinição é inválido ou expirou.{' '}
                <Link to="/esqueci-senha" className="font-medium underline">
                  Solicite um novo
                </Link>
                .
              </p>
            ) : done ? (
              <p className="text-sm text-muted-foreground">Senha atualizada! Redirecionando…</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" variant="cta" className="mt-1" disabled={loading}>
                  {loading ? 'Salvando…' : 'Salvar nova senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
