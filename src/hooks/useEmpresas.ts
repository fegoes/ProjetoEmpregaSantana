import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEmpresasDiretorio(search = '') {
  return useQuery({
    queryKey: ['empresas', 'directory', search],
    queryFn: async () => {
      let query = supabase
        .from('empresas')
        .select('id, nome_fantasia, sector, city, state, is_verified, logo_url, vagas ( id, status )')
        .eq('status', 'active')
        .order('nome_fantasia', { ascending: true })

      if (search) query = query.ilike('nome_fantasia', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useEmpresasCount() {
  return useQuery({
    queryKey: ['empresas', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('empresas')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
      if (error) throw error
      return count ?? 0
    },
  })
}

// Leitura pública (EmpresaDetailPage): passa por empresas_public, que mascara
// os campos estendidos (endereço, missão, organograma etc.) quando a empresa
// marcou como não-visível. Nunca usar em telas de dono/admin — ver useEmpresaAdmin.
// Vagas vêm de uma query separada filtrada por status=published no servidor —
// embutir via vagas(...) traria também os rascunhos da empresa, escondidos só
// no cliente (mesmo problema que o mascaramento de empresas_public resolve).
export function useEmpresa(id: string | undefined) {
  return useQuery({
    queryKey: ['empresas', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [empresaRes, vagasRes] = await Promise.all([
        supabase.from('empresas_public').select('*').eq('id', id as string).single(),
        supabase
          .from('vagas')
          .select(
            'id, title, status, employment_type, pricing_model, category, location_city, location_state, is_remote, is_featured, created_at',
          )
          .eq('empresa_id', id as string)
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false }),
      ])
      if (empresaRes.error) throw empresaRes.error
      if (vagasRes.error) throw vagasRes.error
      return { ...empresaRes.data, vagas: vagasRes.data }
    },
  })
}

// Leitura para o painel admin: tabela base sem máscara, porque moderação
// precisa enxergar os campos mesmo quando a empresa os marcou como ocultos.
export function useEmpresaAdmin(id: string | undefined) {
  return useQuery({
    queryKey: ['empresas', 'admin-detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*, vagas ( id, title, status )')
        .eq('id', id as string)
        .single()
      if (error) throw error
      return data
    },
  })
}
