import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { uploadProfilePhoto } from '@/lib/storage'
import { ImageUploadField } from '@/components/ImageUploadField'
/** O superadmin envia um novo arquivo próprio e associa a foto ao salvar o cadastro. */
export function AdminAvatarField({userId,value,onChange,onUploadingChange,label='Foto do usuário',disabled=false}:{userId?:string;value:string|null|undefined;onChange:(url:string|null)=>void;onUploadingChange?:(busy:boolean)=>void;label?:string;disabled?:boolean}) {
 const {user}=useAuth()
 const profile=useQuery({queryKey:['admin','avatar',userId],enabled:!!userId,queryFn:async()=>{const {data,error}=await supabase.from('profiles').select('avatar_url').eq('id',userId!).single();if(error)throw error;return data.avatar_url}})
 return <section className="space-y-2"><ImageUploadField label={label} purpose="logo" currentUrl={value===undefined?profile.data:value} disabled={!user||disabled||!userId} onUploadingChange={onUploadingChange} onUpload={file=>uploadProfilePhoto(file,userId??user!.id)} onUploaded={onChange} onRemove={()=>onChange(null)} hint="A foto será vinculada ao usuário ao salvar este cadastro." />{!userId&&<p className="text-sm text-muted-foreground">Selecione a conta para adicionar a foto.</p>}{profile.isError&&<p role="alert" className="text-sm text-destructive">Não foi possível carregar a foto atual. <button type="button" className="underline" onClick={()=>profile.refetch()}>Tentar novamente</button></p>}</section>
}
