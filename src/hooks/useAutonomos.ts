import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AutonomoFilters {
  search?: string
  category?: string
}

export function useAutonomosAtivos(filters: AutonomoFilters = {}) {
  return useQuery({
    queryKey: ['autonomos', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('autonomo_profiles')
        .select('*, profiles ( full_name, avatar_url, city, state ), categories ( label )')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.search) query = query.ilike('headline', `%${filters.search}%`)
      if (filters.category) query = query.eq('category', filters.category)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useAutonomo(id: string | undefined) {
  return useQuery({
    queryKey: ['autonomos', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomo_profiles')
        .select('*, profiles ( full_name, avatar_url, city, state, phone ), categories ( label )')
        .eq('id', id as string)
        .single()
      if (error) throw error
      return data
    },
  })
}
