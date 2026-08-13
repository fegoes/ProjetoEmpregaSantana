import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEmpresasDiretorio(search = '') {
  return useQuery({
    queryKey: ['empresas', 'directory', search],
    queryFn: async () => {
      let query = supabase
        .from('empresas')
        .select('*, vagas ( id, status )')
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

export function useEmpresa(id: string | undefined) {
  return useQuery({
    queryKey: ['empresas', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select(
          '*, vagas ( id, title, status, employment_type, pricing_model, location_city, location_state, is_remote, is_featured, created_at )',
        )
        .eq('id', id as string)
        .single()
      if (error) throw error
      return data
    },
  })
}
