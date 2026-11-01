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
  const doc=new DOMParser().parseFromString(html,'text/html'), gallery=doc.querySelector('[data-post-gallery]'),video=doc.querySelector('[data-post-video]'),ad=doc.querySelector('[data-post-ad]')
  if(gallery){const images=Array.from(gallery.querySelectorAll('img')).map(img=>({src:img.getAttribute('src')||'',alt:img.getAttribute('alt')||''}));const save=(next:typeof images)=>onChange(`<figure data-post-gallery="${gallery.getAttribute('data-post-gallery')==='slides'?'slides':'grid'}">${next.map(img=>`<img src="${escape(img.src)}" alt="${escape(img.alt)}" />`).join('')}</figure>`)
    return <div className="space-y-4"><p className="text-sm text-muted-foreground">Escolha suas imagens. Cada imagem dispõe de envio local/link e versões desktop/móvel; clique para ampliar na prévia.</p>{images.map((img,i)=><div key={i} className="space-y-3 border-b pb-4"><EditorialImageField label={`Imagem ${i+1}`} value={img.src} onUploadingChange={uploading} onChange={src=>save(images.map((old,j)=>i===j?{...old,src}:old))} /><Label htmlFor={`${uid}-gallery-alt-${i}`}>Descrição da imagem {i+1}</Label><Input id={`${uid}-gallery-alt-${i}`} value={img.alt} disabled={disabled} onChange={e=>save(images.map((old,j)=>i===j?{...old,alt:e.target.value}:old))} /><Button type="button" variant="ghost" disabled={disabled} onClick={()=>save(images.filter((_,j)=>i!==j))}>Remover imagem {i+1}</Button></div>)}<Button type="button" variant="outline" disabled={disabled||images.length>=12} onClick={()=>save([...images,{src:'',alt:''}])}>Adicionar imagem</Button></div>
  }
  if(video){const href=video.querySelector('a')?.getAttribute('href')||'',valid=postVideo(href);return <div className="space-y-3"><Label htmlFor={`${uid}-post-video-url`}>Link do YouTube, Vimeo ou Instagram</Label><Input id={`${uid}-post-video-url`} value={href} type="url" disabled={disabled} onChange={e=>onChange(`<div data-post-video><a href="${escape(e.target.value)}">Abrir vídeo ou publicação original</a></div>`)} />{href&&!valid&&<p role="alert" className="text-sm text-destructive-ink">Use um link HTTPS válido de vídeo do YouTube, Vimeo ou publicação do Instagram.</p>}<p className="text-xs text-muted-foreground">YouTube e Vimeo podem ser carregados no artigo; Instagram abre a publicação original. A disponibilidade depende da permissão do autor.</p></div>}
  if(ad)return <div className="space-y-3"><p className="text-sm text-muted-foreground">Este conteúdo aparece identificado como Publicidade. Use texto, imagens e links para compor o anúncio.</p><RichTextEditor disabled={disabled} allowImages onUploadingChange={uploading} value={ad.innerHTML} onChange={value=>onChange(`<aside data-post-ad>${value}</aside>`)} /></div>
  return null
}
