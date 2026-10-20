import * as React from 'react'
import { RotateCw, SearchX, SlidersHorizontal } from 'lucide-react'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { FeedFilterPanel } from '@/components/FeedFilterPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'
import { useCategories } from '@/hooks/useCategories'
import {
  DEFAULT_FEED_FILTERS,
  categoryCounts,
  clearPanelFilters,
  countPanelFilters,
  filterAutonomos,
  filterVagas,
  kindOf,
  mergeFeed,
  toggleInList,
  withKind,
  type FeedKind,
} from '@/lib/feedFilters'
import { plural } from '@/lib/format'
import { cn } from '@/lib/utils'

const QUICK_CATEGORIES = 8

function KindTabs({
  value,
  onChange,
  counts,
}: {
  value: FeedKind
  onChange: (kind: FeedKind) => void
  counts: Record<FeedKind, number>
}) {
  const options: { kind: FeedKind; label: string }[] = [
    { kind: 'todos', label: 'Tudo' },
    { kind: 'vagas', label: 'Vagas' },
    { kind: 'autonomos', label: 'Profissionais' },
  ]
  return (
    <div role="group" aria-label="Mostrar" className="grid grid-cols-3 rounded-full bg-secondary p-1 sm:inline-grid sm:w-auto">
      {options.map((o) => {
        const active = value === o.kind
        return (
          <button
            key={o.kind}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.kind)}
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors',
              active ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
            <span className="text-xs text-muted-foreground tabular-nums">
              {counts[o.kind]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex h-44 flex-col gap-3 rounded-2xl border bg-card p-5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-auto h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  )
}

interface FeedBrowserProps {
  /** Termo de busca já confirmado (Explorar). Vazio = feed completo. */
  search?: string
  onClearSearch?: () => void
}

/** Lista de vagas e profissionais com seletor de tipo, categorias rápidas e filtros. Usado na Home e no Explorar. */
export function FeedBrowser({ search = '', onClearSearch }: FeedBrowserProps) {
  const [filters, setFilters] = React.useState(DEFAULT_FEED_FILTERS)
  const vagasQuery = useVagasPublicadas(search ? { search } : {})
  const autonomosQuery = useAutonomosAtivos(search ? { search } : {})
  const { data: categories } = useCategories()

  const kind = kindOf(filters)
  const panelCount = countPanelFilters(filters)
  const loading = vagasQuery.isLoading || autonomosQuery.isLoading
  const failed = vagasQuery.isError || autonomosQuery.isError

  const allVagas = React.useMemo(() => vagasQuery.data ?? [], [vagasQuery.data])
  const allAutonomos = React.useMemo(() => autonomosQuery.data ?? [], [autonomosQuery.data])

  // Contagens do seletor respeitam os filtros do painel, mas não o próprio seletor.
  const vagasFiltradas = React.useMemo(() => filterVagas(allVagas, withKind(filters, 'todos')), [allVagas, filters])
  const autonomosFiltrados = React.useMemo(
    () => filterAutonomos(allAutonomos, withKind(filters, 'todos')),
    [allAutonomos, filters],
  )
  const counts: Record<FeedKind, number> = {
    todos: vagasFiltradas.length + autonomosFiltrados.length,
    vagas: vagasFiltradas.length,
    autonomos: autonomosFiltrados.length,
  }

  const feed = React.useMemo(
    () =>
      mergeFeed(kind === 'autonomos' ? [] : vagasFiltradas, kind === 'vagas' ? [] : autonomosFiltrados),
    [kind, vagasFiltradas, autonomosFiltrados],
  )

  const labelOf = React.useMemo(() => new Map((categories ?? []).map((c) => [c.slug, c.label])), [categories])
  const quickCategories = React.useMemo(() => {
    const counted = categoryCounts(kind === 'autonomos' ? [] : allVagas, kind === 'vagas' ? [] : allAutonomos)
    const slugs = [...counted.keys()].filter((slug) => labelOf.has(slug))
    // Categoria marcada no painel continua visível nos chips mesmo se sair do topo
    const selectedExtra = filters.categories.filter((slug) => !slugs.slice(0, QUICK_CATEGORIES).includes(slug))
    return [...selectedExtra, ...slugs.slice(0, QUICK_CATEGORIES)]
  }, [kind, allVagas, allAutonomos, labelOf, filters.categories])

  const retry = () => {
    void vagasQuery.refetch()
    void autonomosQuery.refetch()
  }

  const summary =
    kind === 'vagas'
      ? plural(counts.vagas, 'vaga', 'vagas')
      : kind === 'autonomos'
        ? plural(counts.autonomos, 'profissional', 'profissionais')
        : `${plural(counts.vagas, 'vaga', 'vagas')} e ${plural(counts.autonomos, 'profissional', 'profissionais')}`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <KindTabs value={kind} onChange={(k) => setFilters((f) => withKind(f, k))} counts={counts} />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal /> Filtros
              {panelCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground tabular-nums">
                  {panelCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent title="Filtros" description={summary}>
            <FeedFilterPanel value={filters} onChange={setFilters} layout="sheet" />
            <div className="sticky bottom-0 -mx-5 mt-6 flex gap-2 border-t bg-card px-5 pt-4">
              {panelCount > 0 && (
                <Button variant="ghost" className="rounded-full" onClick={() => setFilters(clearPanelFilters)}>
                  Limpar
                </Button>
              )}
              <SheetClose asChild>
                <Button className="flex-1">Ver {summary}</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {quickCategories.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Categorias">
            {quickCategories.map((slug) => {
              const active = filters.categories.includes(slug)
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters((f) => ({ ...f, categories: toggleInList(f.categories, slug) }))}
                  className={cn(
                    'h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors md:h-9',
                    active
                      ? 'border-brand-ink bg-brand-ink text-white'
                      : 'border-border bg-card text-foreground hover:border-primary/50',
                  )}
                >
                  {labelOf.get(slug)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden shrink-0 lg:block lg:w-56" aria-label="Filtros">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Filtros</h2>
              {panelCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(clearPanelFilters)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Limpar ({panelCount})
                </button>
              )}
            </div>
            <FeedFilterPanel value={filters} onChange={setFilters} layout="sidebar" />
          </div>
        </aside>

        <div className="min-w-0 flex-1" aria-live="polite" aria-busy={loading}>
          {!loading && !failed && (
            <p className="mb-3 text-sm text-muted-foreground">
              {search ? (
                <>
                  {summary} para <span className="font-medium text-foreground">“{search}”</span>
                </>
              ) : (
                summary
              )}
            </p>
          )}

          {loading && <FeedSkeleton />}

          {failed && !loading && (
            <EmptyState
              icon={RotateCw}
              title="Não conseguimos carregar as vagas"
              description="Pode ser a conexão. Confira sua internet e tente de novo."
              action={
                <Button variant="outline" onClick={retry}>
                  <RotateCw /> Tentar de novo
                </Button>
              }
            />
          )}

          {!loading && !failed && feed.length > 0 && (
            <ShowMoreGrid
              key={`${kind}-${search}`}
              items={feed}
              keyExtractor={(item) => item.key}
              renderItem={(item) =>
                item.kind === 'vaga' ? <VagaCard vaga={item.vaga} /> : <AutonomoCard autonomo={item.autonomo} />
              }
              pageSize={12}
            />
          )}

          {!loading && !failed && feed.length === 0 && (
            <EmptyState
              icon={SearchX}
              title={search ? `Nada encontrado para “${search}”` : 'Nada por aqui com esses filtros'}
              description={
                panelCount > 0
                  ? 'Tire alguns filtros para ver mais resultados.'
                  : search
                    ? 'Tente uma palavra mais simples, como “vendedor” ou “eletricista”.'
                    : 'Ainda não há anúncios publicados neste tipo. Volte em breve.'
              }
              action={
                panelCount > 0 ? (
                  <Button variant="outline" onClick={() => setFilters(clearPanelFilters)}>
                    Limpar filtros
                  </Button>
                ) : search && onClearSearch ? (
                  <Button variant="outline" onClick={onClearSearch}>
                    Limpar busca
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
