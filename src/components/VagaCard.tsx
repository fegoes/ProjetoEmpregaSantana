import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const EMPLOYMENT_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  freelance: 'Freelance',
}

const PRICING_LABELS: Record<string, string> = {
  fixed_salary: 'Salário fixo',
  hourly: 'Por hora',
  per_delivery: 'Por entrega',
}

export interface VagaCardData {
  id: string
  title: string
  employment_type: string
  pricing_model: string
  location_city: string | null
  location_state: string | null
  is_remote: boolean
  is_featured: boolean
  empresas: { nome_fantasia: string; city: string | null; state: string | null } | null
}

export function VagaCard({ vaga }: { vaga: VagaCardData }) {
  const local = vaga.is_remote
    ? 'Remoto'
    : [vaga.location_city, vaga.location_state].filter(Boolean).join(' — ') || 'A combinar'

  return (
    <Link to={`/vagas/${vaga.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{vaga.title}</CardTitle>
            {vaga.is_featured && <Badge>Destaque</Badge>}
          </div>
          <CardDescription>{vaga.empresas?.nome_fantasia ?? 'Vaga EmpregaSantana'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{EMPLOYMENT_LABELS[vaga.employment_type]}</Badge>
          <Badge variant="outline">{PRICING_LABELS[vaga.pricing_model]}</Badge>
          <span>{local}</span>
        </CardContent>
      </Card>
    </Link>
  )
}
