import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { localEditorialPreview } from '@/content/localEditorialPreview'

export type Artigo = Database['public']['Tables']['artigos']['Row']
export type ArtigoInput = Database['public']['Tables']['artigos']['Insert']

export function useArtigos(admin = false) {
  return useQuery({
    queryKey: ['artigos', admin ? 'admin' : 'public'],
    queryFn: async () => {
      let query = supabase.from('artigos').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
      if (!admin) query = query.eq('status', 'published').lte('published_at', new Date().toISOString())
      const { data, error } = await query
      if (error) throw error
      if (!admin && localEditorialPreview.length) {
        const existing = new Set(data.map(article => article.slug))
        return [...data, ...localEditorialPreview.filter(article => !existing.has(article.slug))]
      }
      return data
    },
  })
}

export function useArtigo(slug: string | undefined) {
  return useQuery({
    queryKey: ['artigos', 'detail', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase.from('artigos').select('*').eq('slug', slug!).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle()
      if (error) throw error
      return data ?? localEditorialPreview.find(article => article.slug === slug) ?? null
    },
  })
}

export function useSaveArtigo() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: ArtigoInput) => {
      const { data, error } = await supabase.from('artigos').upsert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ['artigos'] }) },
  })
}

export function useDeleteArtigo() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('artigos').delete().eq('id', id).select('id').single()
      if (error) throw error
    },
    onSuccess: () => { client.invalidateQueries({ queryKey: ['artigos'] }) },
  })
}

export function articleError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (code === '23505') return 'Esse endereço já está em uso. Escolha outro slug para o artigo.'
  if (code === '42501') return 'Sua sessão não permite esta operação. Entre novamente com uma conta de administrador.'
  if (code === 'PGRST205' || code === '42P01') return 'O cadastro de artigos ainda não está disponível neste banco. Aplique a migration 0021 do projeto.'
  return 'Não foi possível salvar a alteração. Confira os campos e tente novamente.'
}
