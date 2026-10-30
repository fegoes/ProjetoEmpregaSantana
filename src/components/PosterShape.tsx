import { cn } from '@/lib/utils'

// Grafismo dos posts "VAGA NOVA" do Instagram (manual §8.2): formas geométricas
// laranja sobre o azul profundo. Puramente decorativo — fica fora da árvore de acessibilidade.
export function PosterShape({ size = 'card', className }: { size?: 'card' | 'band'; className?: string }) {
  if (size === 'band') {
    return (
      <span aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
        {/* celular: só o canto, longe da busca e dos links */}
        <span className="absolute -top-12 -right-12 size-24 rounded-full bg-brand-orange sm:hidden" />
        {/* tablet/desktop: o círculo grande à direita, fora da coluna de texto */}
        <span className="absolute -right-20 -bottom-40 hidden size-96 rounded-full bg-brand-orange sm:block lg:-right-10" />
        <span className="absolute -right-20 -bottom-40 hidden size-96 scale-[1.16] rounded-full border-2 border-brand-orange/45 sm:block lg:-right-10" />
      </span>
    )
  }
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <span className="absolute -top-8 -right-8 size-20 rounded-full bg-brand-orange" />
    </span>
  )
}
