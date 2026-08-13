import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CadastroConfirmarPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Confirme seu e-mail</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>Enviamos um link de confirmação para o e-mail informado. Após confirmar, você já pode entrar.</p>
          <Link to="/login" className="text-primary hover:underline">
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
