import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { IMAGE_ACCEPT, IMAGE_MIME_TYPES } from '@/lib/imageFormats'
import { ImageGuidance } from '@/components/ImageGuidance'
import { Button } from '@/components/ui/button'

export default function GaleriaPage() {
  const { user } = useAuth()
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  const gallery=useQuery({queryKey:['my-image-gallery',user?.id],enabled:!!user,queryFn:async()=>{
    const {data,error}=await supabase.storage.from('user-gallery').list(user!.id,{limit:1000,sortBy:{column:'created_at',order:'desc'}})
    if(error)throw error
    return Promise.all((data??[]).filter(x=>x.id).map(async item=>{
      const path=`${user!.id}/${item.name}`
      const {data,error}=await supabase.storage.from('user-gallery').createSignedUrl(path,300)
      if(error)throw error
      return {path,url:data.signedUrl,name:item.name}
    }))
  },refetchInterval:240000})
  return <section className="max-w-4xl space-y-5">
    <h1 className="text-2xl font-bold">Minha galeria de imagens</h1>
    <p>Somente você tem acesso a esta galeria. As imagens ficam disponíveis para visualização e remoção no seu acesso. Fotos publicadas no perfil, blog ou portfólio são gerenciadas nos respectivos formulários.</p>
    <ImageGuidance purpose="gallery" />
    <label className="block space-y-2"><span className="font-medium">Adicionar imagem à minha galeria</span><input className="block max-w-full" type="file" accept={IMAGE_ACCEPT} disabled={busy||!user} onChange={async e=>{
      const file=e.target.files?.[0];e.target.value='';if(!file||!user)return
      setError('');if(!IMAGE_MIME_TYPES.includes(file.type)||file.size>5242880){setError('Use somente JPG ou PNG, até 5 MB.');return}
      setBusy(true)
      try {const path=`${user.id}/${crypto.randomUUID()}.${file.type==='image/png'?'png':'jpg'}`;const {error}=await supabase.storage.from('user-gallery').upload(path,file);if(error)throw error;await gallery.refetch()}catch{setError('Não foi possível enviar. Confira a conexão e se a migration 0039 foi aplicada.')}finally{setBusy(false)}
    }} /></label>
    {busy&&<p role="status">Enviando imagem…</p>}
    {(error||gallery.isError)&&<p role="alert" className="text-destructive">{error||'Não foi possível carregar a galeria. Confira a conexão e a configuração do armazenamento.'} <button className="underline" onClick={()=>gallery.refetch()}>Tentar novamente</button></p>}
    {gallery.isLoading&&<p role="status">Carregando suas imagens…</p>}
    {gallery.data?.length===0&&<p>Sua galeria está vazia. Adicione a primeira imagem acima.</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{gallery.data?.map(image=><figure key={image.path} className="space-y-2"><img src={image.url} alt="Imagem da sua galeria pessoal" className="aspect-video w-full rounded-lg bg-muted object-contain" /><Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const {error}=await supabase.storage.from('user-gallery').remove([image.path]);if(error)throw error;await gallery.refetch()}catch{setError('Não foi possível remover a imagem. Tente novamente.')}finally{setBusy(false)}}}>Remover da galeria</Button></figure>)}</div>
  </section>
}
