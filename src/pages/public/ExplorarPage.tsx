import * as React from 'react'
import { Input } from '@/components/ui/input'
import { VagaCard } from '@/components/VagaCard'
import { AutonomoCard } from '@/components/AutonomoCard'
import { useVagasPublicadas } from '@/hooks/useVagas'
import { useAutonomosAtivos } from '@/hooks/useAutonomos'

export default function ExplorarPage() {
  const [term, setTerm] = React.useState('')
  const [debounced, setDebounced] = React.useState('')

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(term), 300)
    return () => clearTimeout(timeout)
  }, [term])

  const vagasQuery = useVagasPublicadas({ search: debounced })
  const autonomosQuery = useAutonomosAtivos({ search: debounced })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Explorar</h1>
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Busque por cargo, serviço ou palavra-chave…"
          className="mt-3 max-w-md"
        />
      </div>

      {debounced && (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Vagas ({vagasQuery.data?.length ?? 0})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vagasQuery.data?.map((vaga) => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Autônomos ({autonomosQuery.data?.length ?? 0})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {autonomosQuery.data?.map((autonomo) => (
                <AutonomoCard key={autonomo.id} autonomo={autonomo} />
              ))}
            </div>
          </section>
        </>
      )}

      {!debounced && (
        <p className="text-sm text-muted-foreground">Digite um termo para buscar vagas e autônomos.</p>
      )}
    </div>
  )
}
