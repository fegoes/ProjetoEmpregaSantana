import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function CadastroConfirmarPage() {
  return (
    <AuthLayout title="Confirme seu e-mail">
      <div className="flex flex-col gap-4">
        <MailCheck className="size-10 text-success-ink" strokeWidth={1.75} />
        <p className="text-[15px]">
          Enviamos um link de confirmação para o seu e-mail. Abra a mensagem e toque no link. Depois é só entrar.
        </p>
        <p className="text-sm text-muted-foreground">Não chegou? Confira a pasta de spam ou promoções.</p>
        <Button asChild size="lg" variant="outline">
          <Link to="/login">Ir para o login</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
