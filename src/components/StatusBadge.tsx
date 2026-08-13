import { cn } from '@/lib/utils'

const LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicada',
  paused: 'Pausada',
  closed: 'Encerrada',
  active: 'Ativa',
  pending: 'Pendente',
  suspended: 'Suspensa',
  enviada: 'Enviada',
  em_analise: 'Em análise',
  entrevista: 'Entrevista',
  aprovada: 'Aprovada',
  rejeitada: 'Não aprovada',
}

// Cores semânticas: verde = confirmado/ativo, azul = em andamento, laranja = precisa de atenção, vermelho = negativo/encerrado
const STYLES: Record<string, string> = {
  published: 'bg-success/15 text-success border-success/25',
  active: 'bg-success/15 text-success border-success/25',
  aprovada: 'bg-success/15 text-success border-success/25',
  draft: 'bg-muted text-muted-foreground border-transparent',
  pending: 'bg-brand-orange/15 text-brand-orange-strong border-brand-orange/25',
  em_analise: 'bg-brand-blue/12 text-brand-blue border-brand-blue/25',
  enviada: 'bg-brand-blue/12 text-brand-blue border-brand-blue/25',
  entrevista: 'bg-violet-500/12 text-violet-600 border-violet-500/25 dark:text-violet-400',
  paused: 'bg-brand-orange/15 text-brand-orange-strong border-brand-orange/25',
  suspended: 'bg-destructive/12 text-destructive border-destructive/25',
  closed: 'bg-muted text-muted-foreground border-transparent',
  rejeitada: 'bg-destructive/12 text-destructive border-destructive/25',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STYLES[status] ?? 'bg-muted text-muted-foreground border-transparent',
        className,
      )}
    >
      {LABELS[status] ?? status}
    </span>
  )
}
