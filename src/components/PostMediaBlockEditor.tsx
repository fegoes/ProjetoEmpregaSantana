import { useState } from 'react'
import { useDraftImages } from '@/contexts/draftImagesContext'
import { directPostVideo, validatePostVideo } from '@/lib/videoFormats'
import { confirmAction } from '@/lib/confirmAction'
import { useId } from 'react'
import { EditorialImageField } from './EditorialImageField'
import { RichTextEditor } from './RichTextEditor'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { postVideo } from '@/lib/postSections'
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function PostMediaBlockEditor({html,onChange,disabled,uploading}:{html:string;onChange:(html:string)=>void;disabled:boolean;uploading?:(busy:boolean)=>void}) {
  const uid=useId()
  const draft=useDraftImages()
  const [videoMode,setVideoMode]=useState<'link'|'file'>('link')
  const [videoBusy,setVideoBusy]=useState(false)
  const [videoError,setVideoError]=useState('')
  const doc=new DOMParser().parseFromString(html,'text/html'), gallery=doc.querySelector('[data-post-gallery]'),video=doc.querySelector('[data-post-video]'),ad=doc.querySelector('[data-post-ad]')
  if(gallery){const images=Array.from(gallery.querySelectorAll('img')).map(img=>({src:img.getAttribute('src')||'',alt:img.getAttribute('alt')||''}));const save=(next:typeof images)=>onChange(`<figure data-post-gallery="${gallery.getAttribute('data-post-gallery')==='slides'?'slides':'grid'}">${next.map(img=>`<img src="${escape(img.src)}" alt="${escape(img.alt)}" />`).join('')}</figure>`)
    return <div className="space-y-4">{images.map((img,i)=><div key={i} className="space-y-3 border-b pb-4"><EditorialImageField label={`Imagem ${i+1}`} value={img.src} onUploadingChange={uploading} onChange={src=>save(images.map((old,j)=>i===j?{...old,src}:old))} /><Label htmlFor={`${uid}-gallery-alt-${i}`}>Descrição da imagem {i+1}</Label><Input id={`${uid}-gallery-alt-${i}`} value={img.alt} disabled={disabled} onChange={e=>save(images.map((old,j)=>i===j?{...old,alt:e.target.value}:old))} /><Button type="button" variant="ghost" disabled={disabled} onClick={async()=>{if(await confirmAction('Remover esta imagem da galeria da postagem?'))save(images.filter((_,j)=>i!==j))}}>Remover imagem {i+1}</Button></div>)}<Button type="button" variant="outline" disabled={disabled||images.length>=12} onClick={()=>save([...images,{src:'',alt:''}])}>Adicionar imagem</Button></div>
  }
  if(video){const href=video.querySelector('a')?.getAttribute('href')||'',valid=postVideo(href)||directPostVideo(href)||draft?.store.isVideo(href);const save=(url:string)=>onChange(`<div data-post-video><a href="${escape(url)}">Vídeo</a></div>`)
   return <div className="space-y-3"><fieldset disabled={disabled||videoBusy} className="flex flex-wrap gap-4 text-sm"><legend className="sr-only">Origem do vídeo</legend><label className="flex min-h-11 items-center gap-2"><input type="radio" name={`${uid}-video-mode`} checked={videoMode==='link'} onChange={()=>setVideoMode('link')}/>Link do vídeo</label><label className="flex min-h-11 items-center gap-2"><input type="radio" name={`${uid}-video-mode`} checked={videoMode==='file'} onChange={()=>setVideoMode('file')}/>Enviar vídeo</label></fieldset>
    {videoMode==='link'?<><Label htmlFor={`${uid}-post-video-url`}>Link do YouTube, Vimeo, Instagram ou arquivo de vídeo</Label><Input id={`${uid}-post-video-url`} value={href.startsWith('blob:')?'':href} type="url" disabled={disabled||videoBusy} onChange={e=>save(e.target.value)} /></>:<><Label htmlFor={`${uid}-post-video-file`}>Arquivo de vídeo</Label><input id={`${uid}-post-video-file`} type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={disabled||videoBusy} className="block min-h-11 w-full min-w-0 text-sm" onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setVideoError('');setVideoBusy(true);uploading?.(true);try{validatePostVideo(file);if(!draft)throw new Error('Não foi possível preparar o vídeo. Reabra a postagem e tente novamente.');save(draft.store.stageVideo(file));draft.changed()}catch(error){setVideoError(error instanceof Error?error.message:'Não foi possível selecionar o vídeo.')}finally{setVideoBusy(false);uploading?.(false)}}}/><p className="text-xs text-muted-foreground">MP4 ou WebM · até 50 MB. Envio ao salvar a postagem.</p></>}
    {href&&valid&&<p className="text-xs text-muted-foreground">Vídeo selecionado.</p>}{((href&&!valid)||videoError)&&<p role="alert" className="text-sm text-destructive">{videoError||'Use um link de vídeo válido.'}</p>}
   </div>
  }
  if(ad)return <div className="space-y-3"><p className="text-sm text-muted-foreground">Identificado como Publicidade.</p><RichTextEditor disabled={disabled} allowImages onUploadingChange={uploading} value={ad.innerHTML} onChange={value=>onChange(`<aside data-post-ad>${value}</aside>`)} /></div>
  return null
}
