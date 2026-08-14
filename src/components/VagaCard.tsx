import { Link } from 'react-router-dom'
import { MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { iconForCategory } from '@/lib/categoryIcons'

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
  category?: string | null
  location_city: string | null
  location_state: string | null
  is_remote: boolean
  is_featured: boolean
  photo_url?: string | null
  created_at?: string
  empresas: { nome_fantasia: string; city: string | null; state: string | null; logo_url?: string | null } | null
}

export function VagaCard({ vaga }: { vaga: VagaCardData }) {
  const local = vaga.is_remote
    ? 'Remoto'
    : [vaga.location_city, vaga.location_state].filter(Boolean).join(' — ') || 'A combinar'
  const Icon = iconForCategory(vaga.category)
  const empresaNome = vaga.empresas?.nome_fantasia ?? 'Vaga EmpregaSantana'

  return (
    <Link to={`/vagas/${vaga.id}`} className="group block h-full">
      <Card className="relative h-full gap-3 overflow-hidden rounded-2xl py-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
        {vaga.is_featured && (
          <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-orange-ink backdrop-blur-sm">
            <Sparkles className="size-3" /> Destaque
          </span>
        )}
        {vaga.photo_url && (
          <div className="-mt-5 mb-1 aspect-video w-full overflow-hidden bg-muted">
            <img src={vaga.photo_url} alt={vaga.title} className="size-full object-cover" loading="lazy" />
          </div>
        )}
        <CardHeader className="flex-row items-start gap-3">
          {vaga.empresas?.logo_url ? (
            <img
              src={vaga.empresas.logo_url}
              alt={empresaNome}
              className="size-11 shrink-0 rounded-xl border object-cover"
            />
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
              <Icon className="size-5" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0 pt-0.5">
            <h3 className="line-clamp-2 pr-14 text-[15px] leading-snug font-semibold">{vaga.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{empresaNome}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="rounded-full font-medium">
            {EMPLOYMENT_LABELS[vaga.employment_type]}
          </Badge>
          <Badge variant="outline" className="rounded-full font-medium">
            {PRICING_LABELS[vaga.pricing_model]}
          </Badge>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {local}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
