import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CandidaturaStatus, Database } from '@/types/database'

type VagaInsert = Database['public']['Tables']['vagas']['Insert']

export function useEmpresaVagas(empresaId: string | undefined) {
  return useQuery({
    queryKey: ['vagas', 'by-empresa', empresaId],
    enabled: Boolean(empresaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('empresa_id', empresaId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSaveVaga() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vaga: VagaInsert & { empresa_id: string }) => {
      const { data, error } = await supabase.from('vagas').upsert(vaga).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vagas', 'by-empresa', data.empresa_id ?? undefined] })
      queryClient.invalidateQueries({ queryKey: ['vagas', 'list'] })
    },
  })
}

export function useDeleteVaga() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; empresaId?: string }) => {
      const { error } = await supabase.from('vagas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vagas', 'by-empresa', variables.empresaId] })
      queryClient.invalidateQueries({ queryKey: ['vagas', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'vagas'] })
    },
  })
}

export function useVagaCandidaturas(vagaId: string | undefined) {
  return useQuery({
    queryKey: ['candidaturas', 'by-vaga', vagaId],
    enabled: Boolean(vagaId),
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidaturas')
        .select(
          '*, candidato_profiles ( headline, profiles ( full_name, email ) ), cv_variants ( title, summary_html, contact_email, contact_phone, address, experiences, education, skills )',
        )
        .eq('vaga_id', vagaId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useUpdateCandidaturaStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, vagaId }: { id: string; status: CandidaturaStatus; vagaId: string }) => {
      const { error } = await supabase.from('candidaturas').update({ status }).eq('id', id)
      if (error) throw error
      return vagaId
    },
    onSuccess: (vagaId) => {
      queryClient.invalidateQueries({ queryKey: ['candidaturas', 'by-vaga', vagaId] })
    },
  })
}
