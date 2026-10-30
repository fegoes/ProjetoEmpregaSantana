import type { ReactNode } from 'react'

/** Moldura das telas de acesso: título, uma frase e o formulário. Sem cartão nem fundo decorativo. */
export function AuthLayout({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 sm:py-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted-foreground">{description}</p>}
      </header>
      {children}
      {footer && <div className="border-t pt-5 text-sm text-muted-foreground">{footer}</div>}
    </div>
  )
}
