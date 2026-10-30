import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { ImageCarousel } from '@/components/ImageCarousel'
import { VagaCover } from '@/components/VagaCover'
import { iconForCategory } from '@/lib/categoryIcons'
import { stripHtml } from '@/lib/utils'
import { formatAutonomoPay, formatLocal, timeAgo } from '@/lib/format'

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
  serves_remote?: boolean
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
  const local = formatLocal(autonomo.service_area_city, autonomo.service_area_state, 'Área a combinar')
  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'
  const photos = autonomo.portfolio_urls ?? []
  const excerpt = stripHtml(autonomo.description_html, 140)
  const atualizado = timeAgo(autonomo.created_at)
  const preco = formatAutonomoPay(autonomo)

  return (
    <Link to={`/autonomos/${autonomo.id}`} className="group block h-full">
      <Card className="relative h-full gap-3 overflow-hidden rounded-2xl py-5 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/50 group-hover:shadow-md">
        {autonomo.is_featured && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-xs font-semibold text-brand-orange-ink">
            <Star className="size-3" fill="currentColor" /> Destaque
          </span>
        )}
        {photos.length > 0 ? (
          <ImageCarousel images={photos} alt={name} className="-mt-5 mb-1 aspect-video w-full" />
        ) : (
          <VagaCover seed={autonomo.category ?? autonomo.id} icon={iconForCategory(autonomo.category)} className="-mt-5 mb-1" />
        )}
        <CardHeader className="flex-row items-start gap-3">
          <InitialsAvatar name={name} size="md" />
          <div className="min-w-0 pt-0.5">
            <h3 className="break-words pr-10 text-[15px] leading-snug font-semibold">{name}</h3>
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
          <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {local}
          </span>
          {atualizado && <span className="w-full text-sm text-muted-foreground">No site {atualizado}</span>}
        </CardContent>
        <CardContent>
          <p className={autonomo.hourly_rate != null ? 'text-[15px] font-semibold' : 'text-sm text-muted-foreground'}>{preco}</p>
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
