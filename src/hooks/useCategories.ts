import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { modalidadeLabels } from '@/lib/modalidade'

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

/** Nomes das modalidades de vaga (presencial, remota, híbrida…), do jeito que o superadmin escreveu. */
export function useModalidadeLabels() {
  const { data } = useCategories()
  return React.useMemo(() => modalidadeLabels(data), [data])
}
