import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

// Usado dentro de cards que são <Link>: os controles precisam de
// stopPropagation + preventDefault pra não disparar a navegação do card.
export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [index, setIndex] = React.useState(0)
  const clampedIndex = Math.min(index, images.length - 1)

  if (images.length === 0) return null

  const go = (e: React.MouseEvent, delta: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i + delta + images.length) % images.length)
  }

  return (
    <div className={cn('group/carousel relative size-full overflow-hidden bg-muted', className)}>
      <img src={images[clampedIndex]} alt={alt} className="size-full object-cover" loading="lazy" />
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => go(e, -1)}
            className="absolute top-1/2 left-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => go(e, 1)}
            className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((url, i) => (
              <span
                key={url}
                className={cn('size-1.5 rounded-full transition-colors', i === clampedIndex ? 'bg-white' : 'bg-white/50')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
