import { VAGA_ICON_OPTIONS } from '@/lib/categoryIcons'
import { cn } from '@/lib/utils'

interface IconPickerFieldProps {
  value: string | null
  onChange: (key: string | null) => void
}

export function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
      {VAGA_ICON_OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            title={option.label}
            aria-label={option.label}
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : option.key)}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl border transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            <Icon className="size-4.5" strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}
