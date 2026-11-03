import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Pagina = Database['public']['Tables']['paginas_institucionais']['Row']

const KEY = ['paginas-institucionais'] as const

export function usePaginaInstitucional(slug: string) {
  return useQuery({
    queryKey: [...KEY, 'by-slug', slug],
    // Conteúdo editorial deve ser revalidado em cada acesso, sem herdar
    // os 30 minutos de cache das demais consultas do sistema.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase.from('paginas_institucionais').select('*').eq('slug', slug).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function usePaginaPorId(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'by-id', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('paginas_institucionais').select('*').eq('id', id!).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useAllPaginasInstitucionais() {
  return useQuery({
    queryKey: [...KEY, 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paginas_institucionais')
        .select('*')
        .order('is_system', { ascending: false })
        .order('title')
      if (error) throw error
      return data
    },
  })
}

export interface PaginaMenuItem {
  slug: string
  title: string
  show_in_header: boolean
  show_in_footer: boolean
}

/**
 * Páginas criadas no painel que o superadmin marcou para aparecer no menu do topo
 * e/ou no rodapé. Se a consulta falhar o site segue sem esses links.
 */
export function usePaginasNoMenu() {
  return useQuery({
    queryKey: [...KEY, 'menu'],
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<PaginaMenuItem[]> => {
      const { data, error } = await supabase
        .from('paginas_institucionais')
        .select('slug, title, show_in_header, show_in_footer')
        .eq('is_system', false)
        .eq('is_published', true)
        .or('show_in_header.eq.true,show_in_footer.eq.true')
        .order('title')
      if (error) return []
      return (data ?? []) as PaginaMenuItem[]
    },
  })
}

export type PaginaChanges = Partial<
  Pick<
    Pagina,
    'title' | 'slug' | 'content_html' | 'layout' | 'is_published' | 'show_in_header' | 'show_in_footer' | 'seo_description'
  >
>

export function useSavePagina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, changes, userId }: { id: string; changes: PaginaChanges; userId: string }) => {
      const { error } = await supabase
        .from('paginas_institucionais')
        .update({ ...changes, updated_by: userId })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useCreatePagina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slug, title, layout, userId }: { slug: string; title: string; layout: unknown; userId: string }) => {
      const { data, error } = await supabase
        .from('paginas_institucionais')
        .insert({ slug, title, layout, is_published: false, updated_by: userId })
        .select('id')
        .single()
      if (error) throw error
      return data as { id: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeletePagina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('paginas_institucionais').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
