import * as React from 'react'
import { ListChecks, SearchX } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { EmptyState } from '@/components/EmptyState'
import { ListaProcessos } from '@/components/processo/ListaProcessos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLeituras, useProcessos } from '@/hooks/useProcessos'
import { temNovidade } from '@/lib/hiring'
import { cn } from '@/lib/utils'

type Grupo = 'andamento' | 'contratado' | 'encerrado'

const GRUPOS: { valor: Grupo; rotulo: string }[] = [
  { valor: 'andamento', rotulo: 'Em andamento' },
  { valor: 'contratado', rotulo: 'Contratados' },
  { valor: 'encerrado', rotulo: 'Encerrados' },
]

const grupoDe = (status: 'em_andamento' | 'contratado' | 'encerrado'): Grupo => (status === 'em_andamento' ? 'andamento' : status)

/** Todos os processos seletivos e contratações da empresa, por situação. */
export default function EmpresaProcessosPage() {
  const { user } = useAuth()
  const { empresa } = useEmpresa()
  const { data: processos, isLoading, isError, refetch } = useProcessos(empresa ? { tipo: 'empresa', empresaId: empresa.id } : undefined)
  const { data: leituras } = useLeituras(user?.id)
  const [grupo, setGrupo] = React.useState<Grupo>('andamento')
  const [busca, setBusca] = React.useState('')

  const contagens = React.useMemo(() => {
    const total: Record<Grupo, number> = { andamento: 0, contratado: 0, encerrado: 0 }
    for (const p of processos ?? []) total[grupoDe(p.status)]++
    return total
  }, [processos])

  const novidades = (processos ?? []).filter((p) => temNovidade(p, user?.id, leituras?.get(p.id))).length

  const visiveis = React.useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (processos ?? []).filter((p) => grupoDe(p.status) === grupo && (!termo || `${p.pessoa_nome} ${p.titulo}`.toLowerCase().includes(termo)))
  }, [processos, grupo, busca])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Seleção</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Acompanhe cada candidato e cada contratação por etapas: dê feedback, receba documentos e converse sem sair do site.
          {novidades > 0 && <strong className="ml-1 font-semibold text-foreground">{novidades === 1 ? '1 processo com novidade.' : `${novidades} processos com novidade.`}</strong>}
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Não conseguimos carregar os processos.</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {processos && processos.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="Nenhum processo ainda"
          description="Quando alguém se candidatar a uma das suas vagas, ou você iniciar a contratação de um autônomo, o acompanhamento aparece aqui."
        />
      )}

      {processos && processos.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Situação" className="grid grid-cols-3 rounded-full bg-secondary p-1 sm:inline-grid sm:w-auto">
              {GRUPOS.map((g) => (
                <button
                  key={g.valor}
                  type="button"
                  aria-pressed={grupo === g.valor}
                  onClick={() => setGrupo(g.valor)}
                  className={cn(
                    'flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors sm:px-4',
                    grupo === g.valor ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {g.rotulo}
                  <span className="text-xs text-muted-foreground tabular-nums">{contagens[g.valor]}</span>
                </button>
              ))}
            </div>
            <div className="sm:w-72">
              <label htmlFor="busca-processos" className="sr-only">
                Buscar por nome ou vaga
              </label>
              <Input id="busca-processos" type="search" placeholder="Buscar por nome ou vaga" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>

          {visiveis.length > 0 ? (
            <ListaProcessos processos={visiveis} userId={user?.id ?? ''} leituras={leituras} ladoEmpresa href={(p) => `/empresa/processos/${p.id}`} />
          ) : (
            <EmptyState
              icon={SearchX}
              title={busca ? `Nada encontrado para “${busca}”` : 'Nada nesta situação'}
              description={busca ? 'Tente outro nome ou o título da vaga.' : 'Mude a situação acima para ver os outros processos.'}
            />
          )}
        </>
      )}
    </div>
  )
}
