import * as React from 'react'
import { cn } from '@/lib/utils'

/** Seletor nativo (abre a roleta do celular) com a mesma altura e estilo dos campos de texto. */
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'border-input bg-card flex h-11 w-full min-w-0 rounded-md border px-3 text-base shadow-xs outline-none transition-[color,box-shadow] md:h-10 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
