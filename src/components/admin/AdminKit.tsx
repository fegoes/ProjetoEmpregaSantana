import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Peças comuns das telas do superadmin: cabeçalho, busca com filtros, lista em linhas e avisos.

export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-[68ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export interface AdminFilter<T extends string> {
  value: T
  label: string
  count?: number
}

interface AdminToolbarProps<T extends string> {
  busca: string
  onBusca: (value: string) => void
  placeholder: string
  filtros: AdminFilter<T>[]
  filtro: T
  onFiltro: (value: T) => void
}

/** Campo de busca e, ao lado, os filtros por situação (com a quantidade de cada um). */
export function AdminToolbar<T extends string>({ busca, onBusca, placeholder, filtros, filtro, onFiltro }: AdminToolbarProps<T>) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:px-0 [&::-webkit-scrollbar]:hidden">
        <div role="group" aria-label="Filtrar" className="inline-flex rounded-full bg-secondary p-1">
          {filtros.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filtro === f.value}
              onClick={() => onFiltro(f.value)}
              className={cn(
                'flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
                filtro === f.value ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              {f.count !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{f.count}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="relative xl:w-80">
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type="search" value={busca} onChange={(e) => onBusca(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>
    </div>
  )
}

export function AdminList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">{children}</ul>
}

interface AdminRowProps {
  avatar?: React.ReactNode
  title: React.ReactNode
  /** etiquetas ao lado do título (situação, perfil, destaque…) */
  badges?: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
}

/** Uma linha da lista: quem é, situação, um resumo e as ações que o superadmin pode fazer. */
export function AdminRow({ avatar, title, badges, subtitle, meta, actions }: AdminRowProps) {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="min-w-0 font-semibold break-words">{title}</p>
            {badges}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-1.5 lg:max-w-[28rem] lg:justify-end xl:max-w-[32rem]">{actions}</div>}
    </li>
  )
}

export function AdminAviso({ kind = 'erro', children }: { kind?: 'erro' | 'ok'; children: React.ReactNode }) {
  return (
    <p role={kind === 'erro' ? 'alert' : 'status'} className={cn('text-sm', kind === 'erro' ? 'text-destructive-ink' : 'text-success-ink')}>
      {children}
    </p>
  )
}

export function MostrarMais({ restantes, onMais }: { restantes: number; onMais: () => void }) {
  if (restantes <= 0) return null
  return (
    <div className="flex justify-center">
      <Button type="button" variant="outline" onClick={onMais}>
        Mostrar mais ({restantes})
      </Button>
    </div>
  )
}

/** Etiqueta pequena (perfil, destaque, verificada…). */
export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'blue' | 'orange' | 'green' | 'red' }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        tone === 'neutral' && 'border-transparent bg-muted text-muted-foreground',
        tone === 'blue' && 'border-primary/25 bg-primary/12 text-primary',
        tone === 'orange' && 'border-brand-orange/25 bg-brand-orange/15 text-brand-orange-ink',
        tone === 'green' && 'border-success/25 bg-success/15 text-success-ink',
        tone === 'red' && 'border-destructive/25 bg-destructive/12 text-destructive-ink',
      )}
    >
      {children}
    </span>
  )
}
