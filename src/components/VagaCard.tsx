import { useEmploymentLabels } from '@/hooks/useRecordTypes'
import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageCarousel } from '@/components/ImageCarousel'
import { CompanyLogo } from '@/components/CompanyLogo'
import { iconForVaga } from '@/lib/categoryIcons'
import { stripHtml } from '@/lib/utils'
import { formatLocal, formatVagaPay, hasVagaPayValue, timeAgo } from '@/lib/format'



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
  salary_min?: number | null
  salary_max?: number | null
  salary_visible?: boolean
  hourly_rate?: number | null
  category?: string | null
  icon_key?: string | null
  location_city: string | null
  location_state: string | null
  is_remote: boolean
  is_featured: boolean
  photo_url?: string | null
  photo_urls?: string[] | null
  description_html?: string | null
  created_at?: string
  empresas: { nome_fantasia: string; city: string | null; state: string | null; logo_url?: string | null } | null
}

export function VagaCard({ vaga }: { vaga: VagaCardData }) {
  const employmentLabels = useEmploymentLabels()
  const local = vaga.is_remote ? 'Remoto' : formatLocal(vaga.location_city, vaga.location_state)
  const Icon = iconForVaga(vaga.icon_key, vaga.category)
  const empresaNome = vaga.empresas?.nome_fantasia ?? 'Empresa não informada'
  const photos = vaga.photo_urls?.length ? vaga.photo_urls : vaga.photo_url ? [vaga.photo_url] : []
  const excerpt = stripHtml(vaga.description_html, 140)
  const publicada = timeAgo(vaga.created_at)
  const pagamento = formatVagaPay(vaga)
  const temValor = hasVagaPayValue(vaga)

  return (
    <Link to={`/vagas/${vaga.id}`} className="group block h-full">
      <Card className="relative h-full gap-3 overflow-hidden rounded-2xl py-5 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/50 group-hover:shadow-md">
        {vaga.is_featured && (
          <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-xs font-semibold text-brand-orange-ink backdrop-blur-sm">
            <Star className="size-3" fill="currentColor" /> Destaque
          </span>
        )}
        {photos.length > 0 && <ImageCarousel images={photos} alt={vaga.title} className="-mt-5 mb-1 aspect-video w-full" />}
        <CardHeader className="flex-row items-start gap-3">
          <CompanyLogo name={empresaNome} logoUrl={vaga.empresas?.logo_url} size="md" />
          <div className="min-w-0 pt-0.5">
            <h3 className="line-clamp-2 pr-14 text-[15px] leading-snug font-semibold">{vaga.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{empresaNome}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="gap-1.5 rounded-full font-medium">
            <Icon className="size-3.5" strokeWidth={2} aria-hidden />
            {employmentLabels[vaga.employment_type] ?? vaga.employment_type}
          </Badge>
          <Badge variant="outline" className="rounded-full font-medium">
            {PRICING_LABELS[vaga.pricing_model]}
          </Badge>
          <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {local}
          </span>
          {publicada && <span className="w-full text-sm text-muted-foreground">Publicada {publicada}</span>}
        </CardContent>
        <CardContent>
          <p className={temValor ? 'text-[15px] font-semibold' : 'text-sm text-muted-foreground'}>{pagamento}</p>
        </CardContent>
        {excerpt && (
          <CardContent className="block">
            <p className="overflow-hidden text-xs text-muted-foreground">{excerpt}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
