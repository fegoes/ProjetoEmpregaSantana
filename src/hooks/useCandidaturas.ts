import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMinhasCandidaturas(candidatoId: string | undefined) {
  return useQuery({
    queryKey: ['candidaturas', 'by-candidato', candidatoId],
    enabled: Boolean(candidatoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*, vagas ( id, title, empresas ( nome_fantasia ) )')
        .eq('candidato_id', candidatoId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCandidatar(candidatoId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ vagaId, cvVariantId }: { vagaId: string; cvVariantId: string }) => {
      if (!candidatoId) throw new Error('not-authenticated')
      const { error } = await supabase
        .from('candidaturas')
        .upsert(
          { vaga_id: vagaId, candidato_id: candidatoId, cv_variant_id: cvVariantId },
          { onConflict: 'vaga_id,candidato_id' },
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidaturas', 'by-candidato', candidatoId] })
    },
  })
}

/** O que a candidatura significa para quem se candidatou, em uma frase. */
export const CANDIDATURA_STATUS_HINTS: Record<string, string> = {
  enviada: 'A empresa recebeu seu currículo e ainda não abriu.',
  em_analise: 'A empresa está avaliando seu currículo.',
  entrevista: 'A empresa quer conversar com você. Fique de olho no telefone e no e-mail.',
  aprovada: 'Você foi aprovado(a) para esta vaga.',
  rejeitada: 'Não foi dessa vez. Continue se candidatando a outras vagas.',
}
