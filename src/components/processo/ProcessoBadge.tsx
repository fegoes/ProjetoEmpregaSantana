import { rotuloStatus, tomDoStatus, type Processo } from '@/lib/hiring'
import { cn } from '@/lib/utils'

// Mesmas cores das outras etiquetas: azul = em andamento, verde = contratado, vermelho = a empresa encerrou, cinza = desistência.
export function ProcessoBadge({ processo, className }: { processo: Pick<Processo, 'status' | 'motivo'>; className?: string }) {
  const tom = tomDoStatus(processo)
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        tom === 'andamento' && 'border-primary/25 bg-primary/12 text-primary',
        tom === 'sucesso' && 'border-success/25 bg-success/15 text-success-ink',
        tom === 'encerrado' &&
          (processo.motivo === 'desistencia'
            ? 'border-transparent bg-muted text-muted-foreground'
            : 'border-destructive/25 bg-destructive/12 text-destructive-ink'),
        className,
      )}
    >
      {rotuloStatus(processo)}
    </span>
  )
}

/** Ponto laranja ao lado de "Novidade": há resposta ou mudança de etapa que a pessoa ainda não viu. */
export function NovidadeTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-brand-orange-ink',
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-brand-orange" />
      Novidade
    </span>
  )
}
