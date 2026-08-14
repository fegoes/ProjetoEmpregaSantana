import * as React from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import type { FeedItem } from '@/lib/feedFilters'
import { cn } from '@/lib/utils'

interface FeaturedCarouselProps {
  items: FeedItem[]
}

// Faixa horizontal rolável com os itens em Destaque — complementa a grade
// com filtro lateral que já existe, não substitui.
export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)

  if (items.length === 0) return null

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <Sparkles className="size-4 text-brand-orange-ink" /> Destaques
        </h2>
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            aria-label="Rolar para a esquerda"
            onClick={() => scrollBy(-320)}
            className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Rolar para a direita"
            onClick={() => scrollBy(320)}
            className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {items.map((item) => (
          <div key={item.key} className="w-72 shrink-0 snap-start">
            {item.kind === 'vaga' ? <VagaCard vaga={item.vaga} /> : <AutonomoCard autonomo={item.autonomo} />}
          </div>
        ))}
      </div>
    </section>
  )
}
