import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database, UserRole } from '@/types/database'

type Tables = Database['public']['Tables']
type Perfil = Tables['profiles']['Row']
type Empresa = Tables['empresas']['Row']
type Vaga = Tables['vagas']['Row']
type Autonomo = Tables['autonomo_profiles']['Row']

// Dados e ações das telas do superadmin. A RLS do banco já deixa o superadmin ler e alterar tudo; os
// usuários comuns recebem erro de permissão se tentarem as mesmas chamadas.

const KEY = ['admin'] as const

function contar(valores: (string | null)[]): Map<string, number> {
  const mapa = new Map<string, number>()
  for (const v of valores) if (v) mapa.set(v, (mapa.get(v) ?? 0) + 1)
  return mapa
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

export type AdminUsuario = Perfil & { user_roles: { role: UserRole }[] }

export function useAdminUsuarios() {
  return useQuery({
    queryKey: [...KEY, 'usuarios'],
    queryFn: async (): Promise<AdminUsuario[]> => {
      const { data, error } = await supabase.from('profiles').select('*, user_roles ( role )').order('created_at', { ascending: false })
      if (error) throw error
      return data as AdminUsuario[]
    },
  })
}

export type AdminEmpresa = Empresa & { dono: { full_name: string | null; email: string | null } | null; vagas: number }

export function useAdminEmpresas() {
  return useQuery({
    queryKey: [...KEY, 'empresas'],
    queryFn: async (): Promise<AdminEmpresa[]> => {
      const { data: empresas, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
      if (error) throw error
      const donos = [...new Set(empresas.map((e) => e.owner_id))]
      const [perfis, vagas] = await Promise.all([
        donos.length > 0 ? supabase.from('profiles').select('id, full_name, email').in('id', donos) : Promise.resolve({ data: [], error: null }),
        supabase.from('vagas').select('empresa_id'),
      ])
      const donoPor = new Map((perfis.data ?? []).map((p) => [p.id, { full_name: p.full_name, email: p.email }]))
      const vagasPor = contar((vagas.data ?? []).map((v) => v.empresa_id))
      return empresas.map((e) => ({ ...e, dono: donoPor.get(e.owner_id) ?? null, vagas: vagasPor.get(e.id) ?? 0 }))
    },
  })
}

export type AdminVaga = Vaga & { empresas: { nome_fantasia: string } | null; candidaturas: number }

export function useAdminVagas() {
  return useQuery({
    queryKey: [...KEY, 'vagas'],
    queryFn: async (): Promise<AdminVaga[]> => {
      const [vagas, candidaturas] = await Promise.all([
        supabase.from('vagas').select('*, empresas ( nome_fantasia )').order('created_at', { ascending: false }),
        supabase.from('candidaturas').select('vaga_id'),
      ])
      if (vagas.error) throw vagas.error
      const por = contar((candidaturas.data ?? []).map((c) => c.vaga_id))
      return (vagas.data as (Vaga & { empresas: { nome_fantasia: string } | null })[]).map((v) => ({ ...v, candidaturas: por.get(v.id) ?? 0 }))
    },
  })
}

export type AdminAutonomo = Autonomo & { profiles: { full_name: string | null; email: string | null; phone: string | null } | null }

export function useAdminAutonomos() {
  return useQuery({
    queryKey: [...KEY, 'autonomos'],
    queryFn: async (): Promise<AdminAutonomo[]> => {
      const { data, error } = await supabase
        .from('autonomo_profiles')
        .select('*, profiles ( full_name, email, phone )')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as AdminAutonomo[]
    },
  })
}

export interface AdminResumo {
  usuarios: number
  inativos: number
  admins: number
  candidatos: number
  autonomosPerfil: number
  empresasDonas: number
  empresas: { total: number; ativas: number; pendentes: number; suspensas: number }
  vagas: { total: number; publicadas: number; rascunho: number; pausadas: number; encerradas: number; semEmpresa: number }
  autonomos: { total: number; ativos: number; pausados: number }
  candidaturas: number
  processos: { andamento: number; contratados: number; encerrados: number }
  ultimosUsuarios: Pick<Perfil, 'id' | 'full_name' | 'email' | 'created_at'>[]
  empresasPendentes: Pick<Empresa, 'id' | 'nome_fantasia' | 'city' | 'state' | 'created_at'>[]
}

/** Números da visão geral. Uma tabela que ainda não existe no banco (migration pendente) conta como zero. */
export function useAdminResumo() {
  return useQuery({
    queryKey: [...KEY, 'resumo'],
    queryFn: async (): Promise<AdminResumo> => {
      const n = async (consulta: PromiseLike<{ count: number | null; error: unknown }>) => {
        const r = await consulta
        return r.error ? 0 : (r.count ?? 0)
      }
      const cabeca = { count: 'exact', head: true } as const
      type Tabela = 'profiles' | 'user_roles' | 'empresas' | 'vagas' | 'autonomo_profiles' | 'candidaturas' | 'processos'
      const t = (tabela: Tabela, ...filtros: [coluna: string, operador: 'eq' | 'is', valor: string | boolean | null][]) => {
        let consulta = supabase.from(tabela).select('*', cabeca)
        for (const [coluna, operador, valor] of filtros) consulta = consulta.filter(coluna, operador, valor as never)
        return consulta
      }
      const [
        usuarios, inativos, admins, candidatos, autonomosPerfil, empresasDonas,
        empTotal, empAtivas, empPend, empSusp,
        vagTotal, vagPub, vagRasc, vagPaus, vagEnc, vagSem,
        autTotal, autAtivos, autPaus,
        candidaturas, procAnd, procContr, procEnc,
        ultimos, pendentes,
      ] = await Promise.all([
        n(t('profiles')),
        n(t('profiles', ['is_active', 'eq', false])),
        n(t('profiles', ['is_admin', 'eq', true])),
        n(t('user_roles', ['role', 'eq', 'candidato'])),
        n(t('user_roles', ['role', 'eq', 'autonomo'])),
        n(t('user_roles', ['role', 'eq', 'empresa_owner'])),
        n(t('empresas')),
        n(t('empresas', ['status', 'eq', 'active'])),
        n(t('empresas', ['status', 'eq', 'pending'])),
        n(t('empresas', ['status', 'eq', 'suspended'])),
        n(t('vagas')),
        n(t('vagas', ['status', 'eq', 'published'])),
        n(t('vagas', ['status', 'eq', 'draft'])),
        n(t('vagas', ['status', 'eq', 'paused'])),
        n(t('vagas', ['status', 'eq', 'closed'])),
        n(t('vagas', ['empresa_id', 'is', null])),
        n(t('autonomo_profiles')),
        n(t('autonomo_profiles', ['status', 'eq', 'active'])),
        n(t('autonomo_profiles', ['status', 'eq', 'paused'])),
        n(t('candidaturas')),
        n(t('processos', ['status', 'eq', 'em_andamento'])),
        n(t('processos', ['status', 'eq', 'contratado'])),
        n(t('processos', ['status', 'eq', 'encerrado'])),
        supabase.from('profiles').select('id, full_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('empresas').select('id, nome_fantasia, city, state, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      ])
      return {
        usuarios, inativos, admins, candidatos, autonomosPerfil, empresasDonas,
        empresas: { total: empTotal, ativas: empAtivas, pendentes: empPend, suspensas: empSusp },
        vagas: { total: vagTotal, publicadas: vagPub, rascunho: vagRasc, pausadas: vagPaus, encerradas: vagEnc, semEmpresa: vagSem },
        autonomos: { total: autTotal, ativos: autAtivos, pausados: autPaus },
        candidaturas,
        processos: { andamento: procAnd, contratados: procContr, encerrados: procEnc },
        ultimosUsuarios: ultimos.data ?? [],
        empresasPendentes: pendentes.data ?? [],
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

/** Depois de qualquer mudança, as listas do painel e as públicas (que mostram o mesmo dado) são recarregadas. */
function useRecarregar() {
  const queryClient = useQueryClient()
  return () => {
    for (const key of [KEY, ['vagas'], ['autonomos'], ['empresas'], ['processos']] as const) {
      void queryClient.invalidateQueries({ queryKey: key })
    }
  }
}

export function useAtualizarPerfil() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Pick<Perfil, 'is_active' | 'is_admin'>> }) => {
      const { error } = await supabase.from('profiles').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useExcluirPerfil() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useAtualizarEmpresa() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Pick<Empresa, 'status' | 'is_verified'>> }) => {
      const { error } = await supabase.from('empresas').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useExcluirEmpresa() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('empresas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useAtualizarVaga() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Pick<Vaga, 'status' | 'is_featured'>> }) => {
      const { error } = await supabase.from('vagas').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useExcluirVaga() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vagas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

export function useAtualizarAutonomo() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Pick<Autonomo, 'status' | 'is_featured'>> }) => {
      const { error } = await supabase.from('autonomo_profiles').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: recarregar,
  })
}

/** Apaga o perfil de autônomo e o papel, para a pessoa poder criar de novo se quiser. A conta continua. */
export function useExcluirAutonomo() {
  const recarregar = useRecarregar()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('autonomo_profiles').delete().eq('id', id)
      if (error) throw error
      await supabase.from('user_roles').delete().eq('user_id', id).eq('role', 'autonomo')
    },
    onSuccess: recarregar,
  })
}
