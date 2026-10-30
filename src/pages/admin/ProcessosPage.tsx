import * as React from 'react'
import { ListChecks } from 'lucide-react'
import { AdminAviso, AdminHeader, AdminToolbar, MostrarMais, type AdminFilter } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { ListaProcessos } from '@/components/processo/ListaProcessos'
import { useProcessos } from '@/hooks/useProcessos'
import { usePaged } from '@/hooks/usePaged'
import { matchesSearch } from '@/lib/utils'

type Filtro = 'todos' | 'em_andamento' | 'contratado' | 'encerrado'

/** Todos os processos de seleção e contratação da plataforma, só para acompanhar (leitura). */
export default function AdminProcessosPage() {
  const { data: processos, isLoading, isError } = useProcessos({ tipo: 'todos' })
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('todos')

  const lista = processos ?? []
  const filtros: AdminFilter<Filtro>[] = [
    { value: 'todos', label: 'Todos', count: lista.length },
    { value: 'em_andamento', label: 'Em andamento', count: lista.filter((p) => p.status === 'em_andamento').length },
    { value: 'contratado', label: 'Contratados', count: lista.filter((p) => p.status === 'contratado').length },
    { value: 'encerrado', label: 'Encerrados', count: lista.filter((p) => p.status === 'encerrado').length },
  ]
  const visiveis = lista.filter((p) => (filtro === 'todos' || p.status === filtro) && matchesSearch(busca, p.pessoa_nome, p.empresa_nome, p.titulo))
  const { shown, remaining, more } = usePaged(visiveis, 30, `${filtro}|${busca}`)

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Seleções"
        description="Os processos de seleção e as contratações em andamento na plataforma, entre candidatos, autônomos e empresas. Você acompanha as etapas, a conversa e os documentos; quem conduz são as partes."
      />
      <AdminToolbar busca={busca} onBusca={setBusca} placeholder="Buscar por pessoa, empresa ou vaga" filtros={filtros} filtro={filtro} onFiltro={setFiltro} />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <AdminAviso>Não foi possível carregar as seleções. Se a atualização do banco (migration 0024) ainda não foi aplicada, aplique e recarregue.</AdminAviso>}

      {processos && visiveis.length === 0 && (
        <EmptyState icon={ListChecks} title="Nenhum processo encontrado" description={busca ? 'Tente outro nome.' : 'Ainda não há processos neste grupo.'} />
      )}

      {shown.length > 0 && <ListaProcessos processos={shown} userId="" leituras={undefined} ladoEmpresa={false} admin href={(p) => `/admin/processos/${p.id}`} />}
      <MostrarMais restantes={remaining} onMais={more} />
    </div>
  )
}
