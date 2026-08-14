import * as React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/brand/Logo'

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
    <div className="brand-mesh -mx-4 flex justify-center rounded-3xl px-4 py-10 sm:mx-0">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="items-center text-center">
            <Logo variant="mark" size="lg" asLink={false} className="mb-1" />
            <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
            <CardDescription>Informe seu e-mail e enviaremos um link para redefinir a senha.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-sm text-muted-foreground">
                Se esse e-mail estiver cadastrado, enviamos um link de redefinição. Confira sua caixa de
                entrada (e o spam).
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" variant="cta" className="mt-1" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar link de redefinição'}
                </Button>
              </form>
            )}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-primary hover:underline">
                Voltar para o login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
