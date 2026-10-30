import { cn } from '@/lib/utils'

// Faixa de pontos e traço do board de identidade (manual §8.3): separador entre seções.
export function BrandDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-center gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-brand-orange" />
      <span className="size-1.5 rounded-full bg-brand-orange" />
      <span className="size-1.5 rounded-full bg-brand-orange" />
      <span className="ml-1 h-px flex-1 bg-border" />
    </div>
  )
}
