import { type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { FeedFilterPanel } from '@/components/FeedFilterPanel'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'
import { filterAutonomos, filterVagas, readFeedFilters, writeFeedFilters } from '@/lib/feedFilters'

export default function ExplorarPage() {
  const [params, setParams] = useSearchParams()
  const term = params.get('q') ?? ''
  const city = params.get('cidade') ?? ''
  const filters = readFeedFilters(params)
  const vagasQuery = useVagasPublicadas({ search: term })
  const autonomosQuery = useAutonomosAtivos({ search: term })
  const matchesCity = (value: string | null) => !city || value?.toLocaleLowerCase('pt-BR').includes(city.toLocaleLowerCase('pt-BR'))
  const vagas = filterVagas(vagasQuery.data ?? [], filters).filter(v => matchesCity(v.location_city))
  const autonomos = filterAutonomos(autonomosQuery.data ?? [], filters).filter(a => matchesCity(a.service_area_city))
  const loading = (filters.showVagas && vagasQuery.isLoading) || (filters.showAutonomos && autonomosQuery.isLoading)
  const error = (filters.showVagas && vagasQuery.isError) || (filters.showAutonomos && autonomosQuery.isError)
  useDocumentMeta({ title: 'Vagas e profissionais', description: 'Encontre vagas e profissionais autônomos em Santana do Ipanema e região.' })
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const next = new URLSearchParams(params)
    for (const [key, name] of [['q', 'termo'], ['cidade', 'cidade']]) {
      const value = String(data.get(name) ?? '').trim()
      if (value) next.set(key, value); else next.delete(key)
    }
    setParams(next)
  }
  return <div className="flex flex-col gap-7"><header><h1 className="text-3xl leading-tight font-extrabold tracking-tight text-brand-ink sm:text-4xl">Oportunidades perto de você.</h1><p className="mt-4 text-sm text-muted-foreground">Explore vagas e encontre profissionais para o serviço que você precisa.</p><form key={`${term}-${city}`} onSubmit={search} className="mt-6 grid items-end gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-[1.5fr_1fr_auto]"><div className="space-y-2"><label htmlFor="explore-term" className="text-xs font-medium">Cargo ou serviço</label><Input id="explore-term" name="termo" defaultValue={term} placeholder="Ex.: vendedor, eletricista…" className="h-11" /></div><div className="space-y-2"><label htmlFor="explore-city" className="text-xs font-medium">Cidade</label><Input id="explore-city" name="cidade" defaultValue={city} placeholder="Toda a região" className="h-11" /></div><Button type="submit" variant="cta" className="h-11"><Search />Buscar</Button></form></header>
    <nav aria-label="Tipo de resultado" className="flex flex-wrap gap-5 border-b text-sm">{[
      { label: 'Vagas', showVagas: true, showAutonomos: false },
      { label: 'Autônomos', showVagas: false, showAutonomos: true },
      { label: 'Todos', showVagas: true, showAutonomos: true },
    ].map(option => {
      const active = filters.showVagas === option.showVagas && filters.showAutonomos === option.showAutonomos
      return <Link key={option.label} to={`/explorar?${writeFeedFilters(params, { ...filters, showVagas: option.showVagas, showAutonomos: option.showAutonomos })}`} aria-current={active ? 'page' : undefined} className={`min-h-11 border-b-2 py-3 ${active ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}>{option.label}</Link>
    })}</nav>
    <div className="flex flex-col gap-7 lg:flex-row"><aside className="shrink-0 rounded-2xl border bg-card p-5 lg:w-56"><FeedFilterPanel value={filters} onChange={value => setParams(writeFeedFilters(params, value))} /></aside><div className="min-w-0 flex-1 space-y-8">
      {loading && <p role="status" className="text-sm text-muted-foreground">Buscando oportunidades…</p>}
      {error && <div role="alert" className="rounded-xl border p-5"><p className="text-sm">Não foi possível carregar todos os resultados.</p><Button variant="outline" className="mt-3" onClick={() => { vagasQuery.refetch(); autonomosQuery.refetch() }}>Tentar novamente</Button></div>}
      {vagas.length > 0 && <section><h2 className="mb-4 text-base font-semibold">Vagas ({vagas.length})</h2><ShowMoreGrid key={`vagas-${params}`} items={vagas} keyExtractor={v => v.id} renderItem={v => <VagaCard vaga={v} />} /></section>}
      {autonomos.length > 0 && <section><h2 className="mb-4 text-base font-semibold">Autônomos ({autonomos.length})</h2><ShowMoreGrid key={`autonomos-${params}`} items={autonomos} keyExtractor={a => a.id} renderItem={a => <AutonomoCard autonomo={a} />} /></section>}
      {!loading && !error && vagas.length + autonomos.length === 0 && <EmptyState icon={SearchX} title="Vamos tentar outro caminho?" description="Nenhum resultado corresponde à busca. Tente outro termo ou limpe os filtros." action={<Button variant="outline" onClick={() => setParams({})}>Limpar busca e filtros</Button>} />}
    </div></div>
  </div>
}
