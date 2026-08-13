import { Badge } from '@/components/ui/badge'

const LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicada',
  paused: 'Pausada',
  closed: 'Encerrada',
  active: 'Ativo',
  pending: 'Pendente',
  suspended: 'Suspensa',
  enviada: 'Enviada',
  em_analise: 'Em análise',
  entrevista: 'Entrevista',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
}

const VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  published: 'default',
  active: 'default',
  aprovada: 'default',
  draft: 'secondary',
  pending: 'secondary',
  em_analise: 'secondary',
  enviada: 'secondary',
  entrevista: 'secondary',
  paused: 'outline',
  suspended: 'destructive',
  closed: 'outline',
  rejeitada: 'destructive',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={VARIANTS[status] ?? 'outline'}>{LABELS[status] ?? status}</Badge>
}
