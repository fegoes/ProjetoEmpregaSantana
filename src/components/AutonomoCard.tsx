import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PRICING_LABELS: Record<string, string> = {
  hourly: 'Por hora',
  per_delivery: 'Por entrega',
  both: 'Hora ou entrega',
}

export interface AutonomoCardData {
  id: string
  headline: string | null
  category: string | null
  pricing_model: string
  hourly_rate: number | null
  service_area_city: string | null
  service_area_state: string | null
  is_featured: boolean
  profiles: { full_name: string | null } | null
}

export function AutonomoCard({ autonomo }: { autonomo: AutonomoCardData }) {
  const local =
    [autonomo.service_area_city, autonomo.service_area_state].filter(Boolean).join(' — ') ||
    'A combinar'

  return (
    <Link to={`/autonomos/${autonomo.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              {autonomo.profiles?.full_name ?? 'Profissional autônomo'}
            </CardTitle>
            {autonomo.is_featured && <Badge>Destaque</Badge>}
          </div>
          <CardDescription>{autonomo.headline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {autonomo.category && <Badge variant="secondary">{autonomo.category}</Badge>}
          <Badge variant="outline">{PRICING_LABELS[autonomo.pricing_model]}</Badge>
          <span>{local}</span>
        </CardContent>
      </Card>
    </Link>
  )
}
