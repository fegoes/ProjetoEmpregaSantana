import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { GALLERY_BUCKET } from '@/lib/privateGallery'
export const GALLERY_PAGE_SIZE = 24
export function usePrivateGallery(page = 0) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-image-gallery', user?.id, page], enabled: !!user,
    staleTime: 0, refetchInterval: 240000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(GALLERY_BUCKET).list(user!.id, { limit: GALLERY_PAGE_SIZE, offset: page * GALLERY_PAGE_SIZE, sortBy: { column: 'created_at', order: 'desc' } })
      if (error) throw error
      const items = (data ?? []).filter(item => item.id)
      const paths = items.map(item => `${user!.id}/${item.name}`)
      if (!paths.length) return { images: [], hasMore: false }
      const signed = await supabase.storage.from(GALLERY_BUCKET).createSignedUrls(paths, 300)
      if (signed.error || !signed.data || signed.data.length !== paths.length || signed.data.some(item => item.error || !item.signedUrl)) throw new Error('Não foi possível carregar as prévias da galeria.')
      return { images: items.map((item, index) => ({ path: paths[index], url: signed.data![index].signedUrl!, name: item.name, size: Number(item.metadata?.size ?? 0) })), hasMore: items.length === GALLERY_PAGE_SIZE }
    },
  })
}
