import { useParams } from 'react-router-dom'
import { useVagaCandidaturas, useUpdateCandidaturaStatus } from '@/hooks/useEmpresaVagas'
import type { CandidaturaStatus } from '@/types/database'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const NEXT_STATUS: Partial<Record<CandidaturaStatus, CandidaturaStatus>> = {
  enviada: 'em_analise',
  em_analise: 'entrevista',
  entrevista: 'aprovada',
}

export default function VagaCandidatosPage() {
  const { id } = useParams<{ id: string }>()
  const { data: candidaturas, isLoading } = useVagaCandidaturas(id)
  const updateStatus = useUpdateCandidaturaStatus()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Candidatos</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-3">
        {candidaturas?.map((c) => {
          const nextStatus = NEXT_STATUS[c.status]
          return (
          <Card key={c.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                {c.candidato_profiles?.profiles?.full_name ?? 'Candidato'} — {c.cv_variants?.title}
              </CardTitle>
              <StatusBadge status={c.status} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <RichTextRenderer html={c.cv_variants?.summary_html} />
              <div className="flex gap-2 text-sm">
                {nextStatus && (
                  <button
                    className="text-primary hover:underline"
                    onClick={() => id && updateStatus.mutate({ id: c.id, status: nextStatus, vagaId: id })}
                  >
                    Avançar para "{nextStatus}"
                  </button>
                )}
                {c.status !== 'rejeitada' && (
                  <button
                    className="text-destructive hover:underline"
                    onClick={() => id && updateStatus.mutate({ id: c.id, status: 'rejeitada', vagaId: id })}
                  >
                    Rejeitar
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>
      {candidaturas?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma candidatura recebida ainda.</p>
      )}
    </div>
  )
}
