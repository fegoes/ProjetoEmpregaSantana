import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { AdminAviso, AdminHeader, AdminList, AdminRow, AdminToolbar, MostrarMais, Tag, type AdminFilter } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { useAdminUsuarios, useAtualizarPerfil, useExcluirPerfil, type AdminUsuario } from '@/hooks/useAdmin'
import { usePaged } from '@/hooks/usePaged'
import { dataBR } from '@/lib/format'
import { matchesSearch } from '@/lib/utils'
import { Users } from 'lucide-react'

type Filtro = 'todos' | 'candidato' | 'autonomo' | 'empresa_owner' | 'admin' | 'inativo'

const PERFIL_ROTULO = { candidato: 'Candidato', autonomo: 'Autônomo', empresa_owner: 'Empresa' } as const

const pertence = (u: AdminUsuario, filtro: Filtro) => {
  switch (filtro) {
    case 'todos':
      return true
    case 'admin':
      return u.is_admin
    case 'inativo':
      return !u.is_active
    default:
      return u.user_roles.some((r) => r.role === filtro)
  }
}

function erroDeExclusao(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : ''
  if (message.includes('superadmin')) return 'Não foi possível: deve existir pelo menos um superadmin.'
  if (message.includes('empresas')) return 'Não foi possível excluir: essa pessoa é dona de uma empresa. Exclua ou transfira a empresa primeiro.'
  if (message.includes('vagas')) return 'Não foi possível excluir: essa pessoa tem vagas cadastradas em nome dela.'
  return 'Não foi possível concluir. Tente de novo.'
}

/** Todos os usuários da plataforma, de qualquer perfil: ativar, desativar, dar ou tirar o acesso de superadmin, excluir. */
export default function AdminUsuariosPage() {
  const { user, requestPasswordReset } = useAuth()
  const { data: usuarios, isLoading, isError } = useAdminUsuarios()
  const atualizar = useAtualizarPerfil()
  const excluir = useExcluirPerfil()
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('todos')
  const [aviso, setAviso] = React.useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null)

  const lista = usuarios ?? []
  const filtros: AdminFilter<Filtro>[] = [
    { value: 'todos', label: 'Todos', count: lista.length },
    { value: 'candidato', label: 'Candidatos', count: lista.filter((u) => pertence(u, 'candidato')).length },
    { value: 'autonomo', label: 'Autônomos', count: lista.filter((u) => pertence(u, 'autonomo')).length },
    { value: 'empresa_owner', label: 'Empresas', count: lista.filter((u) => pertence(u, 'empresa_owner')).length },
    { value: 'admin', label: 'Superadmins', count: lista.filter((u) => u.is_admin).length },
    { value: 'inativo', label: 'Inativos', count: lista.filter((u) => !u.is_active).length },
  ]
  const visiveis = lista.filter((u) => pertence(u, filtro) && matchesSearch(busca, u.full_name, u.email, u.phone, u.city))
  const { shown, remaining, more } = usePaged(visiveis, 30, `${filtro}|${busca}`)

  const mudar = (u: AdminUsuario, changes: { is_active?: boolean; is_admin?: boolean }, ok: string, confirmacao?: string) => {
    if (confirmacao && !window.confirm(confirmacao)) return
    setAviso(null)
    atualizar.mutate(
      { id: u.id, changes },
      { onSuccess: () => setAviso({ tipo: 'ok', texto: ok }), onError: (e) => setAviso({ tipo: 'erro', texto: erroDeExclusao(e) }) },
    )
  }

  const apagar = (u: AdminUsuario) => {
    const nome = u.full_name ?? u.email ?? 'este usuário'
    if (!window.confirm(`Excluir "${nome}" para sempre? Currículos, candidaturas e perfil de autônomo dessa pessoa serão apagados junto. Não dá para desfazer.`)) return
    setAviso(null)
    excluir.mutate(u.id, { onSuccess: () => setAviso({ tipo: 'ok', texto: `${nome} foi excluído.` }), onError: (e) => setAviso({ tipo: 'erro', texto: erroDeExclusao(e) }) })
  }

  const redefinir = async (u: AdminUsuario) => {
    if (!u.email) return
    setAviso(null)
    const { error } = await requestPasswordReset(u.email)
    setAviso(error ? { tipo: 'erro', texto: error } : { tipo: 'ok', texto: `Enviamos o link para redefinir a senha para ${u.email}.` })
  }

  const ocupado = atualizar.isPending || excluir.isPending

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Usuários" description="Todas as pessoas cadastradas, de qualquer perfil: candidatos, autônomos, donos de empresa e superadmins." />
      <AdminToolbar busca={busca} onBusca={setBusca} placeholder="Buscar por nome ou e-mail" filtros={filtros} filtro={filtro} onFiltro={setFiltro} />

      {aviso && <AdminAviso kind={aviso.tipo}>{aviso.texto}</AdminAviso>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <AdminAviso>Não foi possível carregar os usuários. Recarregue a página.</AdminAviso>}

      {usuarios && visiveis.length === 0 && (
        <EmptyState icon={Users} title="Nenhum usuário encontrado" description={busca ? 'Tente outro nome ou e-mail.' : 'Não há ninguém neste grupo.'} />
      )}

      {shown.length > 0 && (
        <AdminList>
          {shown.map((u) => {
            const eu = u.id === user?.id
            const nome = u.full_name ?? u.email ?? 'Sem nome'
            return (
              <AdminRow
                key={u.id}
                avatar={<InitialsAvatar name={nome} />}
                title={nome}
                badges={
                  <>
                    {u.is_admin && <Tag tone="blue">Superadmin</Tag>}
                    {u.user_roles.map((r) => (
                      <Tag key={r.role}>{PERFIL_ROTULO[r.role]}</Tag>
                    ))}
                    {!u.is_active && <Tag tone="red">Inativo</Tag>}
                    {eu && <Tag tone="orange">Você</Tag>}
                  </>
                }
                subtitle={u.email}
                meta={[u.city && `${u.city}${u.state ? `, ${u.state}` : ''}`, u.phone, `cadastro em ${dataBR(u.created_at)}`].filter(Boolean).join(' · ')}
                actions={
                  <>
                    <Button size="sm" variant="outline" disabled={!u.email} onClick={() => void redefinir(u)}>
                      Redefinir senha
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ocupado || eu}
                      onClick={() => mudar(u, { is_active: !u.is_active }, u.is_active ? `${nome} foi desativado.` : `${nome} foi ativado.`, u.is_active ? `Desativar ${nome}? A pessoa não consegue mais entrar.` : undefined)}
                    >
                      {u.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ocupado || (eu && u.is_admin)}
                      title={eu && u.is_admin ? 'Você não pode tirar o próprio acesso' : undefined}
                      onClick={() =>
                        mudar(
                          u,
                          { is_admin: !u.is_admin },
                          u.is_admin ? `${nome} deixou de ser superadmin.` : `${nome} agora é superadmin.`,
                          u.is_admin ? `Tirar o acesso de superadmin de ${nome}?` : `Dar acesso TOTAL de superadmin a ${nome}? Ela poderá gerenciar toda a plataforma.`,
                        )
                      }
                    >
                      {u.is_admin ? 'Tirar superadmin' : 'Tornar superadmin'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive-ink" disabled={ocupado || eu} onClick={() => apagar(u)}>
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
