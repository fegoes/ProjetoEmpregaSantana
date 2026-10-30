import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { AdminAviso, AdminHeader, AdminList, AdminRow, AdminToolbar, MostrarMais, Tag, type AdminFilter } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { useAdminEmpresas, useAtualizarEmpresa, useExcluirEmpresa, type AdminEmpresa } from '@/hooks/useAdmin'
import { usePaged } from '@/hooks/usePaged'
import { dataBR, plural } from '@/lib/format'
import { matchesSearch } from '@/lib/utils'

type Filtro = 'todas' | 'active' | 'pending' | 'suspended'

const DA_URL: Record<string, Filtro> = { ativas: 'active', pendentes: 'pending', suspensas: 'suspended' }

const SITUACAO: Record<AdminEmpresa['status'], { rotulo: string; tom: 'green' | 'orange' | 'red' }> = {
  active: { rotulo: 'Ativa', tom: 'green' },
  pending: { rotulo: 'Pendente de aprovação', tom: 'orange' },
  suspended: { rotulo: 'Suspensa', tom: 'red' },
}

/** Todas as empresas: aprovar, suspender, verificar, abrir os dados e excluir. */
export default function AdminEmpresasPage() {
  const [params] = useSearchParams()
  const { data: empresas, isLoading, isError } = useAdminEmpresas()
  const atualizar = useAtualizarEmpresa()
  const excluir = useExcluirEmpresa()
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>(DA_URL[params.get('situacao') ?? ''] ?? 'todas')
  const [aviso, setAviso] = React.useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null)

  const lista = empresas ?? []
  const filtros: AdminFilter<Filtro>[] = [
    { value: 'todas', label: 'Todas', count: lista.length },
    { value: 'pending', label: 'Pendentes', count: lista.filter((e) => e.status === 'pending').length },
    { value: 'active', label: 'Ativas', count: lista.filter((e) => e.status === 'active').length },
    { value: 'suspended', label: 'Suspensas', count: lista.filter((e) => e.status === 'suspended').length },
  ]
  const visiveis = lista.filter(
    (e) =>
      (filtro === 'todas' || e.status === filtro) &&
      matchesSearch(busca, e.nome_fantasia, e.razao_social, e.cnpj, e.city, e.sector, e.dono?.full_name, e.dono?.email),
  )
  const { shown, remaining, more } = usePaged(visiveis, 30, `${filtro}|${busca}`)

  const mudar = (e: AdminEmpresa, changes: { status?: AdminEmpresa['status']; is_verified?: boolean }, ok: string, confirmacao?: string) => {
    if (confirmacao && !window.confirm(confirmacao)) return
    setAviso(null)
    atualizar.mutate(
      { id: e.id, changes },
      { onSuccess: () => setAviso({ tipo: 'ok', texto: ok }), onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível salvar. Tente de novo.' }) },
    )
  }

  const apagar = (e: AdminEmpresa) => {
    if (
      !window.confirm(
        `Excluir "${e.nome_fantasia}" para sempre? As ${plural(e.vagas, 'vaga', 'vagas')} dela, as candidaturas recebidas e a equipe serão apagadas junto. Não dá para desfazer.`,
      )
    )
      return
    setAviso(null)
    excluir.mutate(e.id, {
      onSuccess: () => setAviso({ tipo: 'ok', texto: `${e.nome_fantasia} foi excluída.` }),
      onError: () => setAviso({ tipo: 'erro', texto: 'Não foi possível excluir agora. Tente de novo.' }),
    })
  }

  const ocupado = atualizar.isPending || excluir.isPending

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader actions={<Button asChild variant="cta"><Link to="/admin/empresas/nova">Adicionar</Link></Button>} title="Empresas" description="Aprove os cadastros novos, suspenda quem descumpre as regras, marque as empresas verificadas e veja os dados de cada uma." />
      <AdminToolbar busca={busca} onBusca={setBusca} placeholder="Buscar por nome, CNPJ ou cidade" filtros={filtros} filtro={filtro} onFiltro={setFiltro} />

      {aviso && <AdminAviso kind={aviso.tipo}>{aviso.texto}</AdminAviso>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <AdminAviso>Não foi possível carregar as empresas. Recarregue a página.</AdminAviso>}

      {empresas && visiveis.length === 0 && (
        <EmptyState icon={Building2} title="Nenhuma empresa encontrada" description={busca ? 'Tente outro nome, CNPJ ou cidade.' : 'Não há empresas neste grupo.'} />
      )}

      {shown.length > 0 && (
        <AdminList>
          {shown.map((e) => {
            const s = SITUACAO[e.status]
            return (
              <AdminRow
                key={e.id}
                avatar={e.logo_url ? <img src={e.logo_url} alt="" className="size-10 shrink-0 rounded-xl border object-cover" /> : <InitialsAvatar name={e.nome_fantasia} />}
                title={
                  <Link to={`/admin/empresas/${e.id}`} className="hover:underline">
                    {e.nome_fantasia}
                  </Link>
                }
                badges={
                  <>
                    <Tag tone={s.tom}>{s.rotulo}</Tag>
                    {e.is_verified && <Tag tone="blue">Verificada</Tag>}
                  </>
                }
                subtitle={[[e.city, e.state].filter(Boolean).join(', '), e.sector, e.cnpj].filter(Boolean).join(' · ') || 'Sem dados de localização'}
                meta={`Dono: ${e.dono?.full_name ?? e.dono?.email ?? '—'}${e.dono?.email && e.dono.full_name ? ` (${e.dono.email})` : ''} · ${plural(e.vagas, 'vaga', 'vagas')} · cadastro em ${dataBR(e.created_at)}`}
                actions={
                  <>
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/empresas/${e.id}/editar`}>Editar</Link></Button>
                    {e.status !== 'active' && (
                      <Button size="sm" disabled={ocupado} onClick={() => mudar(e, { status: 'active' }, `${e.nome_fantasia} está ativa.`)}>
                        {e.status === 'pending' ? 'Aprovar' : 'Reativar'}
                      </Button>
                    )}
                    {e.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={ocupado}
                        onClick={() => mudar(e, { status: 'suspended' }, `${e.nome_fantasia} foi suspensa.`, `Suspender ${e.nome_fantasia}? As vagas dela saem do site.`)}
                      >
                        Suspender
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ocupado}
                      onClick={() => mudar(e, { is_verified: !e.is_verified }, e.is_verified ? 'Verificação removida.' : `${e.nome_fantasia} está verificada.`)}
                    >
                      {e.is_verified ? 'Tirar verificação' : 'Verificar'}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/empresas/${e.id}`}>Dados</Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive-ink" disabled={ocupado} onClick={() => apagar(e)}>
                      Excluir
                    </Button>
                  </>
                }
              />
            )
          })}
        </AdminList>
      )}
      <MostrarMais restantes={remaining} onMais={more} />
    </div>
  )
}
