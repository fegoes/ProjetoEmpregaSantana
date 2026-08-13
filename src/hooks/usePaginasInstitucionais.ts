import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePaginaInstitucional(slug: string) {
  return useQuery({
    queryKey: ['paginas-institucionais', 'by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paginas_institucionais')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useAllPaginasInstitucionais() {
  return useQuery({
    queryKey: ['paginas-institucionais', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paginas_institucionais')
        .select('*')
        .order('title')
      if (error) throw error
      return data
    },
  })
}

export function useSavePaginaInstitucional() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      title,
      contentHtml,
      userId,
    }: {
      id: string
      title: string
      contentHtml: string
      userId: string
    }) => {
      const { error } = await supabase
        .from('paginas_institucionais')
        .update({ title, content_html: contentHtml, updated_by: userId })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginas-institucionais'] })
    },
  })
}
