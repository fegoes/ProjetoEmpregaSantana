import { useDraftImages } from '@/contexts/draftImagesContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
export function useImageVariant(url?: string | null) {
 const client=useQueryClient()
 const draft=useDraftImages()
 const query=useQuery({queryKey:['image-variant',url],enabled:!!url&&/^https:\/\//.test(url)&&!url.includes('/storage/v1/object/sign/'),staleTime:300000,retry:false,queryFn:async()=>{
   const {data,error}=await supabase.from('image_variants').select('mobile_url').eq('desktop_url',url!).maybeSingle()
   if(error)throw error
   return data?.mobile_url??null
 }})
 return {...query,data:draft&&url&&draft.store.variants.has(url)?draft.store.variants.get(url):query.data,save:async(mobile:string|null)=>{
  if(!url)throw new Error('Envie a imagem desktop primeiro.')
  if(draft){draft.store.setVariant(url,mobile);draft.changed();return}
  const {error}=mobile?await supabase.from('image_variants').upsert({desktop_url:url,mobile_url:mobile}):await supabase.from('image_variants').delete().eq('desktop_url',url)
  if(error)throw new Error('Não foi possível salvar a versão móvel. Confira a conexão e a migration 0040.')
  client.setQueryData(['image-variant',url],mobile)
 }}
}
