import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** 'mark' = só o selo; 'full' = selo + wordmark */
  variant?: 'mark' | 'full'
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  className?: string
}

const MARK_SIZE = { sm: 'size-8', md: 'size-10', lg: 'size-12' }
const TEXT_SIZE = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }

// Fonte única do lockup. O selo vive em public/brand/logo-mark.svg — anel,
// figura de braços erguidos e os dois currículos. Ver docs/IDENTIDADE_VISUAL.md §2.
export function Logo({ variant = 'full', size = 'md', asLink = true, className }: LogoProps) {
  const isMarkOnly = variant === 'mark'

  const content = (
    <span
      className={cn('flex items-center gap-2.5', className)}
      {...(isMarkOnly && !asLink ? { role: 'img', 'aria-label': 'EmpregaSantana' } : {})}
    >
      <img
        src="/brand/logo-mark.svg"
        alt=""
        aria-hidden
        width={48}
        height={48}
        className={cn(MARK_SIZE[size], 'shrink-0')}
      />
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
