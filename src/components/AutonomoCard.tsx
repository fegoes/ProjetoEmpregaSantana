import { Link } from 'react-router-dom'
import { MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { ImageCarousel } from '@/components/ImageCarousel'
import { stripHtml } from '@/lib/utils'

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
  created_at?: string
  profiles: { full_name: string | null } | null
  categories?: { label: string } | null
  portfolio_urls?: string[] | null
  description_html?: string | null
}

export function AutonomoCard({ autonomo }: { autonomo: AutonomoCardData }) {
  const local =
    [autonomo.service_area_city, autonomo.service_area_state].filter(Boolean).join(' — ') ||
    'A combinar'
  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'
  const photos = autonomo.portfolio_urls ?? []
  const excerpt = stripHtml(autonomo.description_html, 140)

  return (
    <Link to={`/autonomos/${autonomo.id}`} className="group block h-full">
      <Card className="relative h-full gap-3 overflow-hidden rounded-2xl py-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
        {autonomo.is_featured && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-orange-ink">
            <Sparkles className="size-3" /> Destaque
          </span>
        )}
        {photos.length > 0 && <ImageCarousel images={photos} alt={name} className="-mt-5 mb-1 aspect-video w-full" />}
        <CardHeader className="flex-row items-start gap-3">
          <InitialsAvatar name={name} size="md" />
          <div className="min-w-0 pt-0.5">
            <h3 className="truncate pr-16 text-[15px] leading-snug font-semibold">{name}</h3>
            <p className="truncate text-sm text-muted-foreground">{autonomo.headline}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5">
          {autonomo.categories?.label && (
            <Badge variant="secondary" className="rounded-full font-medium">
              {autonomo.categories.label}
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full font-medium">
            {PRICING_LABELS[autonomo.pricing_model]}
          </Badge>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {local}
          </span>
        </CardContent>
        {excerpt && (
          <CardContent className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
            <p className="overflow-hidden text-xs text-muted-foreground">{excerpt}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
