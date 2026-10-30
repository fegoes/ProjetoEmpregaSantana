import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
export function useBlogCategories() {
  return useQuery({queryKey:['blog-categories'],staleTime:0,refetchOnWindowFocus:true,queryFn:async()=>{const {data,error}=await supabase.from('blog_categories').select('*').order('name');if(error)throw error;return data}})
}
