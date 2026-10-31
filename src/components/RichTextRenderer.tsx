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
  const container=React.useRef<HTMLDivElement>(null)
  const sanitized = React.useMemo(() => DOMPurify.sanitize(html ?? ''), [html])

  React.useEffect(()=>{
    let cancelled=false
    const element=container.current
    const images=Array.from(element?.querySelectorAll('img')??[]).filter(i=>i.src.startsWith('https://'))
    const urls=[...new Set(images.map(i=>i.src))]
    if(urls.length)void (async()=>{
      const {data,error}=await supabase.from('image_variants').select('desktop_url,mobile_url').in('desktop_url',urls)
      if(error||cancelled)return
      const lookup=new Map(data?.map(x=>[x.desktop_url,x.mobile_url]))
      for(const img of images){const mobile=lookup.get(img.src);if(!mobile||!img.parentNode)continue
        const picture=document.createElement('picture'),source=document.createElement('source')
        picture.dataset.responsiveImage='true';source.media='(max-width: 639px)';source.srcset=mobile
        img.parentNode.insertBefore(picture,img);picture.append(source,img)
      }
    })().catch(()=>{})
    return ()=>{cancelled=true;element?.querySelectorAll('picture[data-responsive-image]').forEach(p=>{const img=p.querySelector('img');if(img)p.replaceWith(img)})}
  },[sanitized])
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
