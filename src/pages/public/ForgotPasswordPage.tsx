import * as React from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormError } from '@/components/auth/FormError'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: resetError } = await requestPasswordReset(email)
    setLoading(false)
    if (resetError) {
      setError(resetError)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      description="Informe seu e-mail e enviamos um link para você criar uma senha nova."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col gap-3" role="status">
          <MailCheck className="size-9 text-success-ink" strokeWidth={1.75} />
          <p className="text-[15px]">
            Se <span className="font-medium">{email}</span> tiver conta no EmpregaSantana, o link já está a caminho.
            Confira a caixa de entrada e também o spam.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {error && <FormError>{error}</FormError>}
          <Button type="submit" variant="cta" size="lg" className="mt-1" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
