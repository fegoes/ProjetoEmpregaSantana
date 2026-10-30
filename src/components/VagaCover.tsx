import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Card sem foto ficava só com texto. Antes havia um ícone genérico num quadrado —
// o mesmo glifo repetido em dezenas de vagas, que o detector do Impeccable aponta
// como a forma padrão de card gerado por IA. Aqui a capa usa o grafismo do próprio
// selo (anel + círculo laranja) sobre os tons da marca, e o fundo varia por
// categoria para a grade não virar uma parede de retângulos iguais.
const FUNDOS = [
  'bg-brand-ink',
  'bg-primary',
  'bg-brand-ink/90',
  'bg-primary/85',
] as const

function fundoPara(chave: string) {
  let hash = 0
  for (let i = 0; i < chave.length; i++) hash = (hash + chave.charCodeAt(i)) % FUNDOS.length
  return FUNDOS[hash]
}

interface VagaCoverProps {
  /** Define qual variação de fundo sai — normalmente a categoria ou o id. */
  seed: string
  icon: LucideIcon
  className?: string
}

export function VagaCover({ seed, icon: Icon, className }: VagaCoverProps) {
  return (
    <div
      aria-hidden
      className={cn('relative aspect-video w-full overflow-hidden', fundoPara(seed), className)}
    >
      {/* Anel e círculo: o mesmo par do selo da marca */}
      <span className="absolute -right-12 -bottom-20 size-52 rounded-full border-[6px] border-white/25" />
      <span className="absolute -right-5 -bottom-9 size-24 rounded-full bg-brand-orange" />

      {/* Faixa de pontos e traço do manual (§8.3), em escala pequena */}
      <span className="absolute bottom-5 left-6 flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-white/70" />
        <span className="size-1.5 rounded-full bg-white/45" />
        <span className="h-0.5 w-7 rounded-full bg-white/30" />
      </span>

      <Icon className="absolute top-1/2 left-6 size-11 -translate-y-1/2 text-white/90" strokeWidth={1.6} />
    </div>
  )
}
