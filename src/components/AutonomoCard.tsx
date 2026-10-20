import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { ImageCarousel } from '@/components/ImageCarousel'
import { PosterShape } from '@/components/PosterShape'
import { formatAutonomoPay, formatLocal } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface AutonomoCardData {
  id: string
  headline: string | null
  category: string | null
  pricing_model: string
  hourly_rate: number | null
  delivery_rate_note?: string | null
  service_area_city: string | null
  service_area_state: string | null
  is_featured: boolean
  created_at?: string
  profiles: { full_name: string | null } | null
  categories?: { label: string } | null
  portfolio_urls?: string[] | null
  description_html?: string | null
}

/** Card de profissional autônomo: a pessoa na frente (avatar + nome), não um ícone. */
export function AutonomoCard({ autonomo }: { autonomo: AutonomoCardData }) {
  const featured = autonomo.is_featured
  const local = formatLocal(autonomo.service_area_city, autonomo.service_area_state, 'Atende a combinar')
  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'
  const photos = autonomo.portfolio_urls ?? []
  const pay = formatAutonomoPay(autonomo)

  return (
    <Link
      to={`/autonomos/${autonomo.id}`}
      className="group block h-full rounded-2xl focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
    >
      <article
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-150',
          featured
            ? 'border-brand-ink bg-brand-ink text-white group-hover:border-brand-orange'
            : 'bg-card group-hover:border-primary/50',
        )}
      >
        {photos.length > 0 && <ImageCarousel images={photos} alt={`Trabalhos de ${name}`} className="aspect-video w-full" />}
        {featured && photos.length === 0 && <PosterShape />}

        <div className="relative flex flex-1 flex-col gap-3 p-5">
          <div className={cn('flex items-center gap-3', featured && photos.length === 0 && 'pr-9')}>
            <InitialsAvatar name={name} size="md" className={featured ? 'bg-white/15 text-white' : undefined} />
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold decoration-2 group-hover:underline">{name}</h3>
              <p className={cn('truncate text-sm', featured ? 'text-white/75' : 'text-muted-foreground')}>
                {autonomo.headline ?? autonomo.categories?.label ?? 'Profissional autônomo'}
              </p>
            </div>
          </div>

          <p className={cn('text-sm font-medium tabular-nums', featured ? 'text-white' : 'text-foreground')}>{pay}</p>

          <div className={cn('mt-auto flex flex-col gap-1 text-[13px]', featured ? 'text-white/75' : 'text-muted-foreground')}>
            <span>
              <span className={cn('font-medium', featured ? 'text-white' : 'text-primary')}>Profissional</span>
              {autonomo.categories?.label && <> · {autonomo.categories.label}</>}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{local}</span>
            </span>
          </div>

          {featured && (
            <span className="inline-flex items-center gap-1 font-display text-xs font-bold tracking-wide text-brand-orange uppercase">
              <Star className="size-3.5 fill-current" /> Destaque
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
