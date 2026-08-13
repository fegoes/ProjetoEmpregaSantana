import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface VagaFilters {
  search?: string
  category?: string
}

export function useVagasPublicadas(filters: VagaFilters = {}) {
  return useQuery({
    queryKey: ['vagas', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('vagas')
        .select('*, empresas ( id, nome_fantasia, logo_url, city, state )')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.search) query = query.ilike('title', `%${filters.search}%`)
      if (filters.category) query = query.eq('category', filters.category)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useVaga(id: string | undefined) {
  return useQuery({
    queryKey: ['vagas', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*, empresas ( id, nome_fantasia, logo_url, city, state, description_html )')
        .eq('id', id as string)
        .single()
      if (error) throw error
      return data
    },
  })
}
