import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type CvVariant = Database['public']['Tables']['cv_variants']['Row']

export function useCvVariants(candidatoId: string | undefined) {
  return useQuery({
    queryKey: ['cv-variants', candidatoId],
    enabled: Boolean(candidatoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cv_variants')
        .select('*')
        .eq('candidato_id', candidatoId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCvVariant(id: string | undefined) {
  return useQuery({
    queryKey: ['cv-variants', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('cv_variants').select('*').eq('id', id as string).single()
      if (error) throw error
      return data
    },
  })
}

export function useSaveCvVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cv: Partial<CvVariant> & { candidato_id: string; title: string }) => {
      const { data, error } = await supabase.from('cv_variants').upsert(cv).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cv-variants', data.candidato_id] })
    },
  })
}

export function useDeleteCvVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; candidatoId: string }) => {
      const { error } = await supabase.from('cv_variants').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cv-variants', variables.candidatoId] })
    },
  })
}
