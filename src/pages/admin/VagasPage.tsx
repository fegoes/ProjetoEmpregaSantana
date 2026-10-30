import { Link } from 'react-router-dom'
import * as React from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { AdminAviso, AdminHeader, AdminList, AdminRow, AdminToolbar, MostrarMais, Tag, type AdminFilter } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useAdminVagas, useAtualizarVaga, useExcluirVaga, type AdminVaga } from '@/hooks/useAdmin'
import { useModalidadeLabels } from '@/hooks/useCategories'
import { usePaged } from '@/hooks/usePaged'
import { dataBR, plural } from '@/lib/format'
import { modalidadeLocal } from '@/lib/modalidade'
import { matchesSearch } from '@/lib/utils'

type Filtro = 'todas' | 'published' | 'draft' | 'paused' | 'closed' | 'sem_empresa'

/** Todas as vagas publicadas na plataforma: publicar, pausar, encerrar, destacar, abrir no site e excluir. */
export default function AdminVagasPage() {
  const { data: vagas, isLoading, isError } = useAdminVagas()
  const atualizar = useAtualizarVaga()
  const excluir = useExcluirVaga()
  const modalidades = useModalidadeLabels()
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('todas')
  const [aviso, setAviso] = React.useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null)

  const lista = vagas ?? []
  const filtros: AdminFilter<Filtro>[] = [
    { value: 'todas', label: 'Todas', count: lista.length },
    { value: 'published', label: 'Publicadas', count: lista.filter((v) => v.status === 'published').length },
    { value: 'draft', label: 'Rascunho', count: lista.filter((v) => v.status === 'draft').length },
    { value: 'paused', label: 'Pausadas', count: lista.filter((v) => v.status === 'paused').length },
    { value: 'closed', label: 'Encerradas', count: lista.filter((v) => v.status === 'closed').length },
    ...(lista.some((v) => !v.empresas) ? [{ value: 'sem_empresa' as const, label: 'Sem empresa', count: lista.filter((v) => !v.empresas).length }] : []),
  ]
  const visiveis = lista.filter(
    (v) => (filtro === 'todas' || (filtro === 'sem_empresa' ? !v.empresas : v.status === filtro)) && matchesSearch(busca, v.title, v.empresas?.nome_fantasia, v.location_city),
  )
  const { shown, remaining, more } = usePaged(visiveis, 30, `${filtro}|${busca}`)

  const mudar = (v: AdminVaga, changes: { status?: AdminVaga['status']; is_featured?: boolean }, ok: string, confirmacao?: string) => {
    if (confirmacao && !window.confirm(confirmacao)) return
    setAviso(null)
    atualizar.mutate(
      { id: v.id, changes },
      { onSuccess: () => setAviso({ tipo: 'ok', texto: ok }), onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível salvar. Tente de novo.' }) },
    )
  }

  const apagar = (v: AdminVaga) => {
    if (!window.confirm(`Excluir a vaga "${v.title}"? As ${plural(v.candidaturas, 'candidatura', 'candidaturas')} recebida(s) também serão apagadas. Não dá para desfazer.`)) return
    setAviso(null)
    excluir.mutate(v.id, {
      onSuccess: () => setAviso({ tipo: 'ok', texto: 'Vaga excluída.' }),
      onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível excluir agora. Tente de novo.' }),
    })
  }

  const ocupado = atualizar.isPending || excluir.isPending

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader actions={<Button asChild variant="cta"><Link to="/admin/vagas/nova">Adicionar</Link></Button>} title="Vagas" description="Todas as vagas da plataforma, de todas as empresas. Pause ou encerre o que estiver fora das regras e destaque o que merece aparecer primeiro." />
      <AdminToolbar busca={busca} onBusca={setBusca} placeholder="Buscar por título, empresa ou cidade" filtros={filtros} filtro={filtro} onFiltro={setFiltro} />

      {aviso && <AdminAviso kind={aviso.tipo}>{aviso.texto}</AdminAviso>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <AdminAviso>Não foi possível carregar as vagas. Recarregue a página.</AdminAviso>}

      {vagas && visiveis.length === 0 && (
        <EmptyState icon={BriefcaseBusiness} title="Nenhuma vaga encontrada" description={busca ? 'Tente outra palavra.' : 'Não há vagas neste grupo.'} />
      )}

      {shown.length > 0 && (
        <AdminList>
          {shown.map((v) => (
            <AdminRow
              key={v.id}
              title={v.title}
              badges={
                <>
                  <StatusBadge status={v.status} />
                  {v.is_featured && <Tag tone="orange">Destaque</Tag>}
                  {!v.empresas && <Tag tone="red">Sem empresa</Tag>}
                </>
              }
              subtitle={`${v.empresas?.nome_fantasia ?? 'Vaga do superadmin'} · ${modalidadeLocal(v, modalidades)}`}
              meta={`${plural(v.candidaturas, 'candidatura', 'candidaturas')} · criada em ${dataBR(v.created_at)}`}
              actions={
                <>
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/vagas/${v.id}/editar`}>Editar</Link></Button>
                  {v.status !== 'published' && (
                    <Button size="sm" disabled={ocupado} onClick={() => mudar(v, { status: 'published' }, 'Vaga publicada.')}>
                      Publicar
                    </Button>
                  )}
                  {v.status === 'published' && (
                    <Button size="sm" variant="outline" disabled={ocupado} onClick={() => mudar(v, { status: 'paused' }, 'Vaga pausada.', `Pausar "${v.title}"? Ela sai do site até ser publicada de novo.`)}>
                      Pausar
                    </Button>
                  )}
                  {v.status !== 'closed' && (
                    <Button size="sm" variant="outline" disabled={ocupado} onClick={() => mudar(v, { status: 'closed' }, 'Vaga encerrada.', `Encerrar "${v.title}"?`)}>
                      Encerrar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" disabled={ocupado} onClick={() => mudar(v, { is_featured: !v.is_featured }, v.is_featured ? 'Destaque removido.' : 'Vaga em destaque.')}>
                    {v.is_featured ? 'Tirar destaque' : 'Destacar'}
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/vagas/${v.id}`} target="_blank" rel="noopener noreferrer">
                      Ver no site
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive-ink" disabled={ocupado} onClick={() => apagar(v)}>
                    Excluir
                  </Button>
                </>
              }
            />
          ))}
        </AdminList>
      )}
      <MostrarMais restantes={remaining} onMais={more} />
    </div>
  )
}
