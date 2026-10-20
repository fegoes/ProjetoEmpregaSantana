import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Painel que sobe de baixo no celular (ao alcance do polegar) e abre na lateral
// direita no desktop. Base: Radix Dialog — foco preso, Esc fecha, leitor de tela anuncia.
const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-foreground/40',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'duration-200 motion-reduce:animate-none',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col bg-card text-card-foreground shadow-[0_-8px_32px_-8px_oklch(0_0_0/0.25)] outline-none',
          // celular: folha inferior
          'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl pb-[env(safe-area-inset-bottom)]',
          'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom',
          // desktop: painel lateral
          'md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[26rem] md:rounded-none md:rounded-l-3xl md:pb-0',
          'md:data-[state=open]:slide-in-from-right md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-bottom-0',
          'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border md:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2 md:pt-6">
          <div className="min-w-0">
            <DialogPrimitive.Title className="font-display text-lg font-bold">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Fechar"
            className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent }
