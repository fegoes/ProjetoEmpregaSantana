import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'

export default function HomePage() {
  const [tab, setTab] = React.useState<'vagas' | 'autonomos'>('vagas')
  const vagasQuery = useVagasPublicadas()
  const autonomosQuery = useAutonomosAtivos()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Vagas e profissionais disponíveis</h1>
        <p className="text-sm text-muted-foreground">
          Navegue livremente. Para se candidatar ou entrar em contato, crie uma conta gratuita.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'vagas' | 'autonomos')}>
        <TabsList>
          <TabsTrigger value="vagas">Vagas ({vagasQuery.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="autonomos">Autônomos ({autonomosQuery.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="vagas" className="mt-4">
          {vagasQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando vagas…</p>}
          {vagasQuery.isError && (
            <p className="text-sm text-destructive">Não foi possível carregar as vagas.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vagasQuery.data?.map((vaga) => (
              <VagaCard key={vaga.id} vaga={vaga} />
            ))}
          </div>
          {vagasQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma vaga publicada ainda.</p>
          )}
        </TabsContent>

        <TabsContent value="autonomos" className="mt-4">
          {autonomosQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando autônomos…</p>
          )}
          {autonomosQuery.isError && (
            <p className="text-sm text-destructive">Não foi possível carregar os autônomos.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {autonomosQuery.data?.map((autonomo) => (
              <AutonomoCard key={autonomo.id} autonomo={autonomo} />
            ))}
          </div>
          {autonomosQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum autônomo disponível ainda.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
