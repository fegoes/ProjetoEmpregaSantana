import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** 'mark' = só o selo; 'full' = selo + wordmark */
  variant?: 'mark' | 'full'
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  className?: string
}

const MARK_SIZE = { sm: 'size-7', md: 'size-9', lg: 'size-11' }
const ICON_SIZE = { sm: 'size-3.5', md: 'size-4.5', lg: 'size-5.5' }
const TEXT_SIZE = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }

// Fonte única do lockup — antes duplicado em Navbar/RootLayout/LoginPage.
// Provisório: tile + ícone lucide no lugar do selo oficial (ver
// docs/IDENTIDADE_VISUAL.md §6.2/§7). Quando o selo em SVG existir em
// public/brand/logo-mark.svg, troca-se só o miolo deste componente — quem
// chama <Logo /> não muda.
export function Logo({ variant = 'full', size = 'md', asLink = true, className }: LogoProps) {
  const isMarkOnly = variant === 'mark'

  const mark = (
    <span
      aria-hidden={!isMarkOnly || asLink ? true : undefined}
      className={cn(
        MARK_SIZE[size],
        'flex shrink-0 items-center justify-center rounded-2xl bg-brand-ink text-white shadow-sm',
      )}
    >
      <Briefcase className={ICON_SIZE[size]} strokeWidth={2.4} />
    </span>
  )

  const content = (
    <span
      className={cn('flex items-center gap-2.5', className)}
      {...(isMarkOnly && !asLink ? { role: 'img', 'aria-label': 'EmpregaSantana' } : {})}
    >
      {mark}
      {variant === 'full' && (
        <span className={cn('font-display font-extrabold tracking-tight', TEXT_SIZE[size])}>
          Emprega<span className="text-brand-orange-ink">Santana</span>
        </span>
      )}
    </span>
  )

  return asLink ? (
    <Link to="/" aria-label="EmpregaSantana — página inicial">
      {content}
    </Link>
  ) : (
    content
  )
}
