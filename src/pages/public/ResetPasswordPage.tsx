import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { FormError } from '@/components/auth/FormError'

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
      setError('As duas senhas não são iguais. Digite de novo.')
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
    <AuthLayout title="Criar nova senha" description="Escolha uma senha nova para sua conta.">
      {authLoading ? (
        <p className="text-sm text-muted-foreground">Conferindo o link…</p>
      ) : !user ? (
        <FormError>
          Este link já foi usado ou expirou.{' '}
          <Link to="/esqueci-senha" className="font-semibold underline">
            Peça um link novo
          </Link>
          .
        </FormError>
      ) : done ? (
        <p className="text-[15px]" role="status">
          Senha atualizada! Levando você para o seu perfil…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Repita a nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <FormError>{error}</FormError>}
          <Button type="submit" variant="cta" size="lg" className="mt-1" disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
