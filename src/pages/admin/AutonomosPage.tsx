import { confirmAction } from '@/lib/confirmAction'
import { Link } from 'react-router-dom'
import * as React from 'react'
import { Wrench } from 'lucide-react'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { AdminAviso, AdminHeader, AdminList, AdminRow, AdminToolbar, MostrarMais, Tag, type AdminFilter } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { useAdminAutonomos, useAtualizarAutonomo, useExcluirAutonomo, type AdminAutonomo } from '@/hooks/useAdmin'
import { useCategories } from '@/hooks/useCategories'
import { usePaged } from '@/hooks/usePaged'
import { dataBR, formatLocal } from '@/lib/format'
import { matchesSearch } from '@/lib/utils'

type Filtro = 'todos' | 'active' | 'paused' | 'destaque'

/** Todos os profissionais autônomos: pausar, reativar, destacar, abrir o perfil público e excluir o perfil. */
export default function AdminAutonomosPage() {
  const { data: autonomos, isLoading, isError } = useAdminAutonomos()
  const { data: categorias } = useCategories()
  const atualizar = useAtualizarAutonomo()
  const excluir = useExcluirAutonomo()
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('todos')
  const [aviso, setAviso] = React.useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null)

  const rotuloCategoria = React.useMemo(() => new Map((categorias ?? []).map((c) => [c.slug, c.label])), [categorias])
  const lista = autonomos ?? []
  const filtros: AdminFilter<Filtro>[] = [
    { value: 'todos', label: 'Todos', count: lista.length },
    { value: 'active', label: 'Ativos', count: lista.filter((a) => a.status === 'active').length },
    { value: 'paused', label: 'Pausados', count: lista.filter((a) => a.status === 'paused').length },
    { value: 'destaque', label: 'Em destaque', count: lista.filter((a) => a.is_featured).length },
  ]
  const nomeDe = (a: AdminAutonomo) => a.profiles?.full_name ?? a.profiles?.email ?? 'Profissional sem nome'
  const visiveis = lista.filter(
    (a) =>
      (filtro === 'todos' || (filtro === 'destaque' ? a.is_featured : a.status === filtro)) &&
      matchesSearch(busca, nomeDe(a), a.profiles?.email, a.headline, a.service_area_city, a.category ? rotuloCategoria.get(a.category) : null),
  )
  const { shown, remaining, more } = usePaged(visiveis, 30, `${filtro}|${busca}`)

  const mudar = async (a: AdminAutonomo, changes: { status?: AdminAutonomo['status']; is_featured?: boolean }, ok: string, confirmacao?: string) => {
    if (confirmacao && !(await confirmAction(confirmacao))) return
    setAviso(null)
    atualizar.mutate(
      { id: a.id, changes },
      { onSuccess: () => setAviso({ tipo: 'ok', texto: ok }), onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível salvar. Tente de novo.' }) },
    )
  }

  const apagar = async (a: AdminAutonomo) => {
    if (!(await confirmAction(`Excluir o perfil de autônomo de ${nomeDe(a)}? Ele sai do site. A conta da pessoa continua e ela pode criar o perfil de novo. Não dá para desfazer.`))) return
    setAviso(null)
    excluir.mutate(a.id, {
      onSuccess: () => setAviso({ tipo: 'ok', texto: 'Perfil de autônomo excluído.' }),
      onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível excluir agora. Tente de novo.' }),
    })
  }

  const ocupado = atualizar.isPending || excluir.isPending

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader actions={<Button asChild variant="cta"><Link to="/admin/autonomos/novo">Adicionar</Link></Button>} title="Autônomos" description="Os perfis de profissionais que aparecem no site. Pause quem estiver fora das regras e destaque quem merece." />
      <AdminToolbar busca={busca} onBusca={setBusca} placeholder="Buscar por nome, serviço ou cidade" filtros={filtros} filtro={filtro} onFiltro={setFiltro} />

      {aviso && <AdminAviso kind={aviso.tipo}>{aviso.texto}</AdminAviso>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <AdminAviso>Não foi possível carregar os autônomos. Recarregue a página.</AdminAviso>}

      {autonomos && visiveis.length === 0 && (
        <EmptyState icon={Wrench} title="Nenhum autônomo encontrado" description={busca ? 'Tente outro nome ou serviço.' : 'Não há perfis neste grupo.'} />
      )}

      {shown.length > 0 && (
        <AdminList>
          {shown.map((a) => (
            <AdminRow
              key={a.id}
              avatar={<InitialsAvatar name={nomeDe(a)} />}
              title={nomeDe(a)}
              badges={
                <>
                  <Tag tone={a.status === 'active' ? 'green' : 'neutral'}>{a.status === 'active' ? 'Ativo' : 'Pausado'}</Tag>
                  {a.is_featured && <Tag tone="orange">Destaque</Tag>}
                </>
              }
              subtitle={[a.headline, a.category ? (rotuloCategoria.get(a.category) ?? a.category) : null].filter(Boolean).join(' · ') || 'Sem título do serviço'}
              meta={`Atende em ${formatLocal(a.service_area_city, a.service_area_state, 'área a combinar')} · ${a.profiles?.email ?? 'sem e-mail'} · cadastro em ${dataBR(a.created_at)}`}
              actions={
                <>
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/autonomos/${a.id}/editar`}>Editar</Link></Button>
                  <Button
                    size="sm"
                    variant={a.status === 'active' ? 'outline' : 'default'}
                    disabled={ocupado}
                    onClick={() =>
                      mudar(a, { status: a.status === 'active' ? 'paused' : 'active' }, a.status === 'active' ? 'Perfil pausado.' : 'Perfil ativado.', a.status === 'active' ? `Pausar o perfil de ${nomeDe(a)}? Ele sai do site.` : undefined)
                    }
                  >
                    {a.status === 'active' ? 'Pausar' : 'Ativar'}
                  </Button>
                  <Button size="sm" variant="outline" disabled={ocupado} onClick={() => mudar(a, { is_featured: !a.is_featured }, a.is_featured ? 'Destaque removido.' : 'Perfil em destaque.')}>
                    {a.is_featured ? 'Tirar destaque' : 'Destacar'}
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/autonomos/${a.id}`} target="_blank" rel="noopener noreferrer">
                      Ver no site
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive-ink" disabled={ocupado} onClick={() => apagar(a)}>
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
