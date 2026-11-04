import { supabase } from './supabase'
import { validatePostVideo } from './videoFormats'
export async function uploadEditorialVideo(file: File): Promise<string> {
 validatePostVideo(file)
 const { data: auth, error: authError } = await supabase.auth.getUser()
 if (authError || !auth.user) throw new Error('Entre na sua conta para enviar o vídeo.')
 const path = `${auth.user.id}/${crypto.randomUUID()}.${file.type === 'video/mp4' ? 'mp4' : 'webm'}`
 const { error } = await supabase.storage.from('post-videos').upload(path, file, { upsert: false, cacheControl: '3600' })
 if (error) throw new Error('Não foi possível enviar o vídeo. Confira o armazenamento de vídeos e tente novamente.')
 return supabase.storage.from('post-videos').getPublicUrl(path).data.publicUrl
}
