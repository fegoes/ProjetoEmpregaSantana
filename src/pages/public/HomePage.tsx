import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { HandHeart, Search, Users } from 'lucide-react'
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
import { useEmpresasCount } from '@/hooks/useEmpresas'
import { DEFAULT_FEED_FILTERS, filterAutonomos, filterVagas, mergeFeed } from '@/lib/feedFilters'

export default function HomePage() {
  const { user } = useAuth()
  const [term, setTerm] = React.useState('')
  const [filters, setFilters] = React.useState(DEFAULT_FEED_FILTERS)
  const navigate = useNavigate()
  const vagasQuery = useVagasPublicadas()
  const autonomosQuery = useAutonomosAtivos()
  const empresasCount = useEmpresasCount()

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

  const featuredFeed = React.useMemo(() => {
    const vagas = (vagasQuery.data ?? []).filter((v) => v.is_featured)
    const autonomos = (autonomosQuery.data ?? []).filter((a) => a.is_featured)
    return mergeFeed(vagas, autonomos)
  }, [vagasQuery.data, autonomosQuery.data])

  return (
    <div className="flex flex-col gap-8">
      {!user && (
        <section className="brand-mesh relative -mx-4 overflow-hidden rounded-3xl border px-6 py-12 sm:mx-0 sm:px-12">
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/70 ring-1 ring-border">
              <HandHeart className="size-3.5" /> Conecta · Orienta · Transforma
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
              Encontre sua próxima <span className="text-primary">vaga</span> ou o{' '}
              <span className="text-brand-orange-ink">profissional certo</span> para o seu serviço
            </h1>
            <p className="mt-3 text-muted-foreground text-balance">
              Somos muito mais que uma página: somos a sua conexão de empregabilidade no sertão.
              Vagas fixas, trabalhos temporários e autônomos — tudo em um só lugar, sem complicação.
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

            <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="sr-only">Vagas ativas</dt>
                <dd className="text-xl font-extrabold">{vagasQuery.data?.length ?? '–'}</dd>
                <dd className="text-xs text-muted-foreground">vagas ativas</dd>
              </div>
              <div>
                <dt className="sr-only">Autônomos</dt>
                <dd className="text-xl font-extrabold">{autonomosQuery.data?.length ?? '–'}</dd>
                <dd className="text-xs text-muted-foreground">autônomos</dd>
              </div>
              <div>
                <dt className="sr-only">Empresas</dt>
                <dd className="text-xl font-extrabold">{empresasCount.data ?? '–'}</dd>
                <dd className="text-xs text-muted-foreground">empresas</dd>
              </div>
            </dl>
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
