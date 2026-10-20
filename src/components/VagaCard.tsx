import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { ImageCarousel } from '@/components/ImageCarousel'
import { PosterShape } from '@/components/PosterShape'
import { EMPLOYMENT_LABELS, formatLocal, formatVagaPay, hasVagaPayValue, isVagaNova, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface VagaCardData {
  id: string
  title: string
  employment_type: string
  pricing_model: string
  salary_min?: number | null
  salary_max?: number | null
  hourly_rate?: number | null
  salary_visible?: boolean | null
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

export function VagaNovaTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-[4px] bg-brand-orange px-1.5 font-display text-[11px] font-bold tracking-wide whitespace-nowrap text-brand-orange-foreground uppercase',
        className,
      )}
    >
      Vaga nova
    </span>
  )
}

/** Card de vaga. O destaque vira o cartaz "VAGA NOVA" da marca: azul profundo com o grafismo laranja. */
export function VagaCard({ vaga, hideEmpresa = false }: { vaga: VagaCardData; hideEmpresa?: boolean }) {
  const featured = vaga.is_featured
  const local = vaga.is_remote ? 'Remoto' : formatLocal(vaga.location_city, vaga.location_state)
  const empresaNome = vaga.empresas?.nome_fantasia ?? 'Vaga EmpregaSantana'
  const photos = vaga.photo_urls?.length ? vaga.photo_urls : vaga.photo_url ? [vaga.photo_url] : []
  const pay = formatVagaPay(vaga)
  const nova = isVagaNova(vaga.created_at)

  return (
    <Link
      to={`/vagas/${vaga.id}`}
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
        {photos.length > 0 && <ImageCarousel images={photos} alt={vaga.title} className="aspect-video w-full" />}
        {featured && photos.length === 0 && <PosterShape />}

        <div className="relative flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className={cn('min-w-0 flex-1', featured && photos.length === 0 && 'pr-9')}>
              <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold decoration-2 group-hover:underline">
                {vaga.title}
              </h3>
              {!hideEmpresa && (
                <p className={cn('mt-0.5 truncate text-sm', featured ? 'text-white/75' : 'text-muted-foreground')}>
                  {empresaNome}
                </p>
              )}
            </div>
            {!featured && vaga.empresas?.logo_url && (
              <img
                src={vaga.empresas.logo_url}
                alt=""
                className="size-10 shrink-0 rounded-lg border object-cover"
                loading="lazy"
                width={40}
                height={40}
              />
            )}
          </div>

          <p
            className={cn(
              'tabular-nums',
              hasVagaPayValue(vaga) ? 'text-base font-semibold' : 'text-sm font-medium',
              !hasVagaPayValue(vaga) && (featured ? 'text-white/80' : 'text-muted-foreground'),
            )}
          >
            {pay}
          </p>

          <div className={cn('mt-auto flex flex-col gap-1 text-[13px]', featured ? 'text-white/75' : 'text-muted-foreground')}>
            <span className={cn('font-medium', featured ? 'text-white' : 'text-foreground')}>
              {EMPLOYMENT_LABELS[vaga.employment_type] ?? vaga.employment_type}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{local}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {featured && (
              <span className="inline-flex items-center gap-1 font-display font-bold tracking-wide text-brand-orange uppercase">
                <Star className="size-3.5 fill-current" /> Destaque
              </span>
            )}
            {nova && <VagaNovaTag />}
            {vaga.created_at && (
              <span className={cn('ml-auto whitespace-nowrap', featured ? 'text-white/70' : 'text-muted-foreground')}>
                {timeAgo(vaga.created_at)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
