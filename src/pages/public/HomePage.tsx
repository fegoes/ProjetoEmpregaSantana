import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, HandHeart, Search, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'
import { useEmpresasCount } from '@/hooks/useEmpresas'

export default function HomePage() {
  const [tab, setTab] = React.useState<'vagas' | 'autonomos'>('vagas')
  const [term, setTerm] = React.useState('')
  const navigate = useNavigate()
  const vagasQuery = useVagasPublicadas()
  const autonomosQuery = useAutonomosAtivos()
  const empresasCount = useEmpresasCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(term ? `/explorar?q=${encodeURIComponent(term)}` : '/explorar')
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="brand-mesh relative -mx-4 overflow-hidden rounded-3xl border px-6 py-12 sm:mx-0 sm:px-12">
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/70 ring-1 ring-border">
            <HandHeart className="size-3.5" /> Feito para conectar pessoas de verdade
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            Encontre sua próxima <span className="text-primary">vaga</span> ou o{' '}
            <span className="text-brand-orange-ink">profissional certo</span> para o seu serviço
          </h1>
          <p className="mt-3 text-muted-foreground text-balance">
            Vagas fixas, trabalhos temporários e autônomos disponíveis — tudo em um só lugar, sem
            complicação. Navegue à vontade; crie uma conta só quando quiser agir.
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

      <section>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'vagas' | 'autonomos')}>
          <TabsList className="h-11 rounded-full bg-secondary p-1">
            <TabsTrigger value="vagas" className="gap-1.5 rounded-full data-[state=active]:shadow-sm">
              <Briefcase className="size-4" /> Vagas ({vagasQuery.data?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="autonomos" className="gap-1.5 rounded-full data-[state=active]:shadow-sm">
              <Users className="size-4" /> Autônomos ({autonomosQuery.data?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vagas" className="mt-5">
            {vagasQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando vagas…</p>}
            {vagasQuery.isError && (
              <p className="text-sm text-destructive">Não foi possível carregar as vagas.</p>
            )}
            {vagasQuery.data && vagasQuery.data.length > 0 && (
              <ShowMoreGrid
                items={vagasQuery.data}
                keyExtractor={(vaga) => vaga.id}
                renderItem={(vaga) => <VagaCard vaga={vaga} />}
              />
            )}
            {vagasQuery.data?.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="Nenhuma vaga publicada ainda"
                description="Volte em breve — novas vagas aparecem por aqui assim que as empresas publicarem."
              />
            )}
          </TabsContent>

          <TabsContent value="autonomos" className="mt-5">
            {autonomosQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Carregando autônomos…</p>
            )}
            {autonomosQuery.isError && (
              <p className="text-sm text-destructive">Não foi possível carregar os autônomos.</p>
            )}
            {autonomosQuery.data && autonomosQuery.data.length > 0 && (
              <ShowMoreGrid
                items={autonomosQuery.data}
                keyExtractor={(autonomo) => autonomo.id}
                renderItem={(autonomo) => <AutonomoCard autonomo={autonomo} />}
              />
            )}
            {autonomosQuery.data?.length === 0 && (
              <EmptyState
                icon={Users}
                title="Nenhum autônomo disponível ainda"
                description="Profissionais de serviços aparecerão aqui assim que publicarem seus perfis."
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
