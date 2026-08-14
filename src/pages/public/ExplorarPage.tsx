import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { FeedFilterPanel } from '@/components/FeedFilterPanel'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'
import { DEFAULT_FEED_FILTERS, filterAutonomos, filterVagas } from '@/lib/feedFilters'

export default function ExplorarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [term, setTerm] = React.useState(searchParams.get('q') ?? '')
  const [debounced, setDebounced] = React.useState(searchParams.get('q') ?? '')
  const [filters, setFilters] = React.useState(DEFAULT_FEED_FILTERS)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(term)
      setSearchParams(term ? { q: term } : {}, { replace: true })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  const vagasQuery = useVagasPublicadas({ search: debounced })
  const autonomosQuery = useAutonomosAtivos({ search: debounced })

  const vagas = React.useMemo(() => filterVagas(vagasQuery.data ?? [], filters), [vagasQuery.data, filters])
  const autonomos = React.useMemo(
    () => filterAutonomos(autonomosQuery.data ?? [], filters),
    [autonomosQuery.data, filters],
  )
  const totalResults = vagas.length + autonomos.length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Explorar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busque por cargo, categoria de serviço ou palavra-chave entre vagas e autônomos.
        </p>
        <div className="relative mt-4 max-w-lg">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: eletricista, vendedor, designer…"
            className="h-11 rounded-full pl-10"
          />
        </div>
        <div className="mt-4 max-w-2xl rounded-2xl border p-4">
          <FeedFilterPanel value={filters} onChange={setFilters} layout="inline" />
        </div>
      </div>

      {debounced && (
        <>
          {vagas.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-muted-foreground">
                Vagas <span className="text-foreground">({vagas.length})</span>
              </h2>
              <ShowMoreGrid
                key={`vagas-${debounced}`}
                items={vagas}
                keyExtractor={(vaga) => vaga.id}
                renderItem={(vaga) => <VagaCard vaga={vaga} />}
              />
            </section>
          )}

          {autonomos.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-muted-foreground">
                Autônomos <span className="text-foreground">({autonomos.length})</span>
              </h2>
              <ShowMoreGrid
                key={`autonomos-${debounced}`}
                items={autonomos}
                keyExtractor={(autonomo) => autonomo.id}
                renderItem={(autonomo) => <AutonomoCard autonomo={autonomo} />}
              />
            </section>
          )}

          {totalResults === 0 && !vagasQuery.isLoading && !autonomosQuery.isLoading && (
            <EmptyState
              icon={SearchX}
              title={`Nada encontrado para "${debounced}"`}
              description="Tente um termo mais genérico ou ajuste os filtros acima."
            />
          )}
        </>
      )}

      {!debounced && (
        <EmptyState
          icon={Search}
          title="Digite algo para começar"
          description="Busque por cargos como “vendedor”, categorias como “construção” ou serviços como “eletricista”."
        />
      )}
    </div>
  )
}
