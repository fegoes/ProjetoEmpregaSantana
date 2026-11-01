import { useDraftImages } from '@/contexts/draftImagesContext'
import { supabase } from '@/lib/supabase'
import { RICH_TEXT_CLASS } from '@/lib/richText'
import * as React from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'

interface RichTextRendererProps {
  html: string | null | undefined
  className?: string
}

// Regra fixa do projeto (docs/PRD.md seção 5): todo HTML gerado por usuário
// (Tiptap) passa por DOMPurify antes de ir para dangerouslySetInnerHTML.
export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const draft=useDraftImages()
  const container=React.useRef<HTMLDivElement>(null)
  const sanitized = React.useMemo(() => {
    let source = html ?? ''
    const refs = draft?.store.localRefs() ?? []
    const placeholders = refs.map(ref => [ref, `https://draft-preview.invalid/${encodeURIComponent(ref)}`] as const)
    for (const [ref, placeholder] of placeholders) source = source.replaceAll(ref, placeholder)
    let cleaned = DOMPurify.sanitize(source)
    for (const [ref, placeholder] of placeholders) cleaned = cleaned.replaceAll(placeholder, ref)
    return cleaned
  }, [html, draft])

  React.useEffect(()=>{
    let cancelled=false
    const element=container.current
    const images=Array.from(element?.querySelectorAll('img')??[]).filter(i=>i.src.startsWith('https://')||draft?.store.isLocal(i.src))
    const urls=[...new Set(images.filter(i=>i.src.startsWith('https://')&&!draft?.store.variants.has(i.src)).map(i=>i.src))]
    if(images.length)void (async()=>{
      const lookup=new Map<string,string|null>()
      if(urls.length){
        const {data}=await supabase.from('image_variants').select('desktop_url,mobile_url').in('desktop_url',urls)
        data?.forEach(x=>lookup.set(x.desktop_url,x.mobile_url))
      }
      if(cancelled)return
      draft?.store.variants.forEach((mobile,desktop)=>lookup.set(desktop,mobile))
      for(const img of images){const mobile=lookup.get(img.src);if(!mobile||!img.parentNode)continue
        const picture=document.createElement('picture'),source=document.createElement('source')
        picture.dataset.responsiveImage='true';source.media='(max-width: 639px)';source.srcset=mobile
        img.parentNode.insertBefore(picture,img);picture.append(source,img)
      }
    })().catch(()=>{})
    return ()=>{cancelled=true;element?.querySelectorAll('picture[data-responsive-image]').forEach(p=>{const img=p.querySelector('img');if(img)p.replaceWith(img)})}
  },[sanitized,draft])
  if (!sanitized) return null

  return (
    <div ref={container}
      className={cn(
        '[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl max-w-none text-sm leading-relaxed [&_a]:underline [&_a]:text-primary [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold',
        RICH_TEXT_CLASS,
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
