import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Inbox } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CANDIDATURA_STATUS_HINTS, useMinhasCandidaturas } from '@/hooks/useCandidaturas'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/format'

export default function CandidaturasPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { data: candidaturas, isLoading, isError, refetch } = useMinhasCandidaturas(user?.id)

  // Link antigo "?aplicar=<vaga>": a candidatura agora acontece na própria página da vaga
  const aplicar = searchParams.get('aplicar')
  if (aplicar) return <Navigate to={`/vagas/${aplicar}?candidatar=1`} replace />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Minhas candidaturas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe aqui o andamento de cada vaga.</p>
        </div>
        <Button asChild variant="outline" className="self-start sm:self-auto">
          <Link to="/candidato/cv">Meus currículos</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Não conseguimos carregar suas candidaturas.</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {candidaturas && candidaturas.length > 0 && (
        <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
          {candidaturas.map((c) => (
            <li key={c.id}>
              <Link
                to={`/vagas/${c.vaga_id}`}
                className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/60 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-semibold group-hover:underline">{c.vagas?.title ?? 'Vaga removida'}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {c.vagas?.empresas?.nome_fantasia}
                    {c.vagas?.empresas?.nome_fantasia && ' · '}
                    enviada {timeAgo(c.created_at)}
                  </p>
                  <p className="mt-1.5 text-sm">{CANDIDATURA_STATUS_HINTS[c.status]}</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {candidaturas?.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="Você ainda não se candidatou"
          description="Quando enviar seu currículo para uma vaga, ela aparece aqui com o andamento."
          action={
            <Button asChild variant="cta">
              <Link to="/">Ver vagas</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
