import { Check, Minus, X } from 'lucide-react'
import { dataCurta, horarioDaMensagem, progresso, resumoAndamento, type Etapa, type Mensagem, type Processo } from '@/lib/hiring'
import { cn } from '@/lib/utils'

interface EtapasTimelineProps {
  processo: Processo
  etapas: Etapa[]
  /** feedbacks da empresa, por etapa */
  feedbacks: Map<string, Mensagem[]>
}

function Marcador({ etapa, processo }: { etapa: Etapa; processo: Processo }) {
  const encerrada = processo.status === 'encerrado' && etapa.id === processo.etapa_atual_id
  const base = 'absolute top-0 left-0 flex size-7 items-center justify-center rounded-full border-2'
  if (encerrada) {
    return (
      <span aria-hidden className={cn(base, 'border-destructive bg-destructive/12 text-destructive-ink')}>
        <X className="size-4" strokeWidth={2.5} />
      </span>
    )
  }
  if (etapa.status === 'concluida') {
    const contratacao = processo.status === 'contratado' && etapa.id === processo.etapa_atual_id
    return (
      <span aria-hidden className={cn(base, contratacao ? 'border-success bg-success text-white' : 'border-primary bg-primary text-primary-foreground')}>
        <Check className="size-4" strokeWidth={3} />
      </span>
    )
  }
  if (etapa.status === 'atual') {
    return (
      <span aria-hidden className={cn(base, 'border-primary bg-card')}>
        <span className="size-2.5 rounded-full bg-primary" />
      </span>
    )
  }
  if (etapa.status === 'pulada') {
    return (
      <span aria-hidden className={cn(base, 'border-dashed border-muted-foreground/50 bg-card text-muted-foreground')}>
        <Minus className="size-4" />
      </span>
    )
  }
  return <span aria-hidden className={cn(base, 'border-border bg-card')} />
}

function situacaoDaEtapa(etapa: Etapa, processo: Processo): string | null {
  if (processo.status === 'encerrado' && etapa.id === processo.etapa_atual_id) return 'Processo encerrado nesta etapa'
  if (etapa.status === 'concluida' && etapa.concluida_em) return `Concluída em ${dataCurta(etapa.concluida_em)}`
  if (etapa.status === 'atual') return etapa.iniciada_em ? `Etapa atual, desde ${dataCurta(etapa.iniciada_em)}` : 'Etapa atual'
  if (etapa.status === 'pulada') return 'Pulada'
  return null
}

/** Linha do tempo: etapas concluídas, a atual e as que faltam, com o feedback que a empresa deixou em cada uma. */
export function EtapasTimeline({ processo, etapas, feedbacks }: EtapasTimelineProps) {
  const pct = progresso(processo, etapas)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="font-display text-base font-bold">{resumoAndamento(processo, etapas)}</p>
        <div
          role="progressbar"
          aria-label="Andamento do processo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-2 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none', processo.status === 'contratado' ? 'bg-success' : 'bg-primary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="flex flex-col">
        {etapas.map((etapa, i) => {
          const situacao = situacaoDaEtapa(etapa, processo)
          const notas = feedbacks.get(etapa.id) ?? []
          const ultima = i === etapas.length - 1
          const atual = etapa.status === 'atual' && processo.status === 'em_andamento'
          return (
            <li
              key={etapa.id}
              aria-current={atual ? 'step' : undefined}
              className={cn(
                'relative pl-11',
                !ultima && 'pb-6 before:absolute before:top-7 before:bottom-0 before:left-[13px] before:w-0.5 before:bg-border',
                !ultima && (etapa.status === 'concluida' || etapa.status === 'pulada') && 'before:bg-primary/40',
              )}
            >
              <Marcador etapa={etapa} processo={processo} />
              <p className={cn('pt-0.5 leading-snug font-semibold', etapa.status === 'pendente' && 'text-muted-foreground')}>{etapa.titulo}</p>
              {situacao && <p className={cn('text-sm', atual ? 'font-medium text-primary' : 'text-muted-foreground')}>{situacao}</p>}
              {etapa.descricao && etapa.status !== 'concluida' && etapa.status !== 'pulada' && (
                <p className="mt-1 text-sm text-muted-foreground">{etapa.descricao}</p>
              )}
              {notas.length > 0 && (
                <ul className="mt-2 flex flex-col gap-2">
                  {notas.map((nota) => (
                    <li key={nota.id} className="border-l-2 border-primary/50 pl-3">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Feedback da empresa</p>
                      <p className="text-sm whitespace-pre-wrap">{nota.corpo}</p>
                      <p className="text-xs text-muted-foreground">{horarioDaMensagem(nota.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
