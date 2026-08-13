import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface EmpresaCardData {
  id: string
  nome_fantasia: string
  sector: string | null
  city: string | null
  state: string | null
  is_verified: boolean
  vagas: { id: string; status: string }[] | null
}

export function EmpresaCard({ empresa }: { empresa: EmpresaCardData }) {
  const vagasAbertas = (empresa.vagas ?? []).filter((v) => v.status === 'published').length

  return (
    <Link to={`/empresas/${empresa.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{empresa.nome_fantasia}</CardTitle>
            {empresa.is_verified && <Badge>Verificada</Badge>}
          </div>
          <CardDescription>{empresa.sector ?? 'Setor não informado'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{[empresa.city, empresa.state].filter(Boolean).join(' — ') || 'Local não informado'}</span>
          <Badge variant="secondary">{vagasAbertas} vaga(s) aberta(s)</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
