import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { NovidadeTag, ProcessoBadge } from '@/components/processo/ProcessoBadge'
import type { ProcessoComEtapas } from '@/hooks/useProcessos'
import { progresso, resumoAndamento, temNovidade } from '@/lib/hiring'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ListaProcessosProps {
  processos: ProcessoComEtapas[]
  userId: string
  leituras: Map<string, string> | undefined
  /** endereço da tela do processo, conforme o painel de quem está vendo */
  href: (processo: ProcessoComEtapas) => string
  /** empresa vê o nome da pessoa; a pessoa vê o nome da empresa */
  ladoEmpresa: boolean
  /** superadmin: mostra a pessoa, a empresa e a vaga juntas */
  admin?: boolean
}

/** Lista de processos: situação, etapa atual, barra de andamento e aviso de novidade. */
export function ListaProcessos({ processos, userId, leituras, href, ladoEmpresa, admin = false }: ListaProcessosProps) {
  return (
    <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
      {processos.map((p) => {
        const novo = !admin && temNovidade(p, userId, leituras?.get(p.id))
        const pct = progresso(p, p.etapas)
        return (
          <li key={p.id}>
            <Link to={href(p)} className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/60 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className={cn('font-semibold group-hover:underline', novo && 'text-foreground')}>{ladoEmpresa || admin ? p.pessoa_nome : p.titulo}</p>
                  <ProcessoBadge processo={p} />
                  {novo && <NovidadeTag />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {admin ? `${p.empresa_nome} · ${p.titulo}` : ladoEmpresa ? p.titulo : p.empresa_nome} · atualizado {timeAgo(p.ultima_atividade_em)}
                </p>
                <p className="mt-1.5 text-sm">{resumoAndamento(p, p.etapas)}</p>
                {p.etapas.length > 0 && (
                  <div aria-hidden className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-secondary">
                    <div className={cn('h-full rounded-full', p.status === 'contratado' ? 'bg-success' : 'bg-primary')} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
