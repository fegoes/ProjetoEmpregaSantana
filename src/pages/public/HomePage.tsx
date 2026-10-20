import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { FeedFilterPanel } from '@/components/FeedFilterPanel'
import { FeaturedCarousel } from '@/components/FeaturedCarousel'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'
import { DEFAULT_FEED_FILTERS, filterAutonomos, filterVagas, mergeFeed } from '@/lib/feedFilters'
import { contarRecentes, publicadaHa } from '@/lib/utils'

export default function HomePage() {
  const { user } = useAuth()
  const [term, setTerm] = React.useState('')
  const [filters, setFilters] = React.useState(DEFAULT_FEED_FILTERS)
  const navigate = useNavigate()
  const vagasQuery = useVagasPublicadas()
  const autonomosQuery = useAutonomosAtivos()

  useDocumentMeta({
    title: 'Vagas e autônomos',
    description:
      'Vagas fixas e temporárias, e profissionais autônomos, em um só lugar. Encontre sua próxima vaga ou contrate um profissional de confiança.',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(term ? `/explorar?q=${encodeURIComponent(term)}` : '/explorar')
  }

  const feed = React.useMemo(() => {
    const vagas = filterVagas(vagasQuery.data ?? [], filters)
    const autonomos = filterAutonomos(autonomosQuery.data ?? [], filters)
    return mergeFeed(vagas, autonomos)
  }, [vagasQuery.data, autonomosQuery.data, filters])

  // Atividade real em vez de total acumulado: o total não diz se o site está
  // vivo, e com catálogo pequeno um número grande só levanta suspeita.
  const atividade = React.useMemo(() => {
    const vagas = vagasQuery.data ?? []
    if (vagas.length === 0) return null
    const novas = contarRecentes(vagas, 7)
    const maisRecente = vagas
      .map((v) => v.created_at)
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1)
    const ultima = publicadaHa(maisRecente)
    if (!novas && !ultima) return null
    return { novas, ultima }
  }, [vagasQuery.data])

  const featuredFeed = React.useMemo(() => {
    const vagas = (vagasQuery.data ?? []).filter((v) => v.is_featured)
    const autonomos = (autonomosQuery.data ?? []).filter((a) => a.is_featured)
    return mergeFeed(vagas, autonomos)
  }, [vagasQuery.data, autonomosQuery.data])

  return (
    <div className="flex flex-col gap-8">
      {!user && (
        <section className="brand-edge relative -mx-4 overflow-hidden rounded-3xl border px-6 py-12 sm:mx-0 sm:px-12">
          <div className="relative mx-auto max-w-2xl text-center">
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            Vagas e profissionais de{' '}
            <span className="text-primary">Santana do Ipanema</span> e região
          </h1>
          <p className="mt-3 text-muted-foreground text-balance">
            Somos muito mais que uma página: somos a sua conexão de empregabilidade no sertão.
            Vagas fixas, trabalhos temporários e autônomos para contratar direto.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Cargo, serviço ou palavra-chave…"
                className="h-11 rounded-full bg-background pl-10 shadow-sm"
              />
            </div>
            <Button type="submit" size="lg" variant="cta" className="h-11">
              Buscar
            </Button>
          </form>

          {atividade && (
            <p className="mt-6 text-sm text-muted-foreground">
              {atividade.novas > 0 && (
                <>
                  <strong className="font-semibold text-foreground">
                    {atividade.novas} {atividade.novas === 1 ? 'vaga nova' : 'vagas novas'}
                  </strong>{' '}
                  nos últimos 7 dias
                </>
              )}
              {atividade.novas > 0 && atividade.ultima && ' · '}
              {atividade.ultima && <>última publicação {atividade.ultima}</>}
            </p>
          )}
          </div>
        </section>
      )}

      {user && (
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Vagas e autônomos para você</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {feed.length} oportunidade{feed.length === 1 ? '' : 's'} disponíve
            {feed.length === 1 ? 'l' : 'is'} agora.
          </p>
        </div>
      )}

      <FeaturedCarousel items={featuredFeed} />

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <FeedFilterPanel value={filters} onChange={setFilters} layout="sidebar" />
        </aside>

        <div className="min-w-0 flex-1">
          {(vagasQuery.isLoading || autonomosQuery.isLoading) && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {(vagasQuery.isError || autonomosQuery.isError) && (
            <p className="text-sm text-destructive">Não foi possível carregar o feed.</p>
          )}

          {feed.length > 0 ? (
            <ShowMoreGrid
              items={feed}
              keyExtractor={(item) => item.key}
              renderItem={(item) =>
                item.kind === 'vaga' ? <VagaCard vaga={item.vaga} /> : <AutonomoCard autonomo={item.autonomo} />
              }
              pageSize={12}
            />
          ) : (
            !vagasQuery.isLoading &&
            !autonomosQuery.isLoading && (
              <EmptyState
                icon={Users}
                title="Nada por aqui com esses filtros"
                description="Tente ajustar ou limpar os filtros na lateral para ver mais resultados."
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
