import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { uploadProfilePhoto } from '@/lib/storage'
import { ImageUploadField } from './ImageUploadField'
export function ProfilePhotoField() {
  const {user,profile,refreshProfile}=useAuth()
  const [error,setError]=useState('')
  if(!user)return null
  return <section className="space-y-2"><ImageUploadField label="Foto do perfil" purpose="logo" currentUrl={profile?.avatar_url} onUpload={async file=>{
    setError('');const url=await uploadProfilePhoto(file,user.id)
    const {error}=await supabase.from('profiles').update({avatar_url:url}).eq('id',user.id).select('id').single()
    if(error)throw error
    return url
  }} onUploaded={()=>{void refreshProfile().catch(()=>setError('Foto salva. Atualize a página para recarregar o perfil.'))}} hint="A foto do perfil pode ser exibida junto aos seus dados públicos." />{error&&<p role="alert">{error}</p>}</section>
}
