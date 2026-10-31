import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { IMAGE_MIME_TYPES } from '@/lib/imageFormats'
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
    {(['desktop','mobile'] as const).map(device=><ImageSourcePicker key={device} label={`Imagem ${device==='desktop'?'desktop':'móvel'} — galeria privada`} disabled={busy||!user} onFile={async file=>{
      if(!user)throw new Error('Entre na sua conta para enviar imagens.')
      if(!IMAGE_MIME_TYPES.includes(file.type)||file.size>5242880)throw new Error('Use somente JPG ou PNG, até 5 MB.')
      setError('');setBusy(true)
      try{const path=`${user.id}/${device}-${crypto.randomUUID()}.${file.type==='image/png'?'png':'jpg'}`;const {error}=await supabase.storage.from('user-gallery').upload(path,file);if(error)throw new Error('Não foi possível salvar na sua galeria. Confira a conexão e a configuração do armazenamento.');await gallery.refetch()}finally{setBusy(false)}
    }} />)}
    {busy&&<p role="status">Enviando imagem…</p>}
    {(error||gallery.isError)&&<p role="alert" className="text-destructive">{error||'Não foi possível carregar a galeria. Confira a conexão e a configuração do armazenamento.'} <button className="underline" onClick={()=>gallery.refetch()}>Tentar novamente</button></p>}
    {gallery.isLoading&&<p role="status">Carregando suas imagens…</p>}
    {gallery.data?.length===0&&<p>Sua galeria está vazia. Adicione a primeira imagem acima.</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{gallery.data?.map(image=><figure key={image.path} className="space-y-2"><img src={image.url} alt={`Imagem ${image.name.startsWith('mobile-')?'móvel':'desktop'} da sua galeria pessoal`} className="aspect-video w-full rounded-lg bg-muted object-contain" /><Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const {error}=await supabase.storage.from('user-gallery').remove([image.path]);if(error)throw error;await gallery.refetch()}catch{setError('Não foi possível remover a imagem. Tente novamente.')}finally{setBusy(false)}}}>Remover da galeria</Button></figure>)}</div>
  </section>
}
