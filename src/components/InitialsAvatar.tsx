import { cn } from '@/lib/utils'

const PALETTE = [
  'bg-brand-blue/15 text-brand-blue',
  'bg-brand-cyan/20 text-brand-blue',
  'bg-brand-orange/20 text-brand-orange-strong',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
]

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function paletteIndexOf(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % PALETTE.length
  return hash
}

interface InitialsAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

export function InitialsAvatar({ name, size = 'md', className }: InitialsAvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
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
