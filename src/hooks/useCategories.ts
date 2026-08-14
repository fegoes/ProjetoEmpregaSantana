import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('label')
      if (error) throw error
      return data
    },
  })
}
