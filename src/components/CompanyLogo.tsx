import { cn } from '@/lib/utils'

// Empresa sem logo deixava um buraco no card — ou, pior, um ícone genérico de
// categoria, que é igual para dezenas de empresas diferentes. O monograma usa a
// inicial do nome: não é a marca real, mas identifica, e duas empresas distintas
// nunca ficam idênticas.
const PALETTE = [
  'bg-primary/12 text-primary',
  'bg-brand-ink/10 text-brand-ink',
  'bg-brand-orange/18 text-brand-orange-ink',
  'bg-muted text-foreground/70',
]

function initialsOf(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    // Preposições não entram na sigla: "Casa do Sertão" vira CS, não CD.
    .filter((p) => p.length > 2 || /^[A-Z0-9]/.test(p))
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function paletteIndexOf(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % PALETTE.length
  return hash
}

const SIZES = {
  sm: 'size-9 text-xs rounded-lg',
  md: 'size-11 text-sm rounded-xl',
  lg: 'size-16 text-xl rounded-2xl',
}

interface CompanyLogoProps {
  name: string
  logoUrl?: string | null
  size?: keyof typeof SIZES
  className?: string
}

export function CompanyLogo({ name, logoUrl, size = 'md', className }: CompanyLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo de ${name}`}
        loading="lazy"
        className={cn('shrink-0 border object-cover', SIZES[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center font-semibold',
        SIZES[size],
        PALETTE[paletteIndexOf(name)],
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </div>
  )
}
