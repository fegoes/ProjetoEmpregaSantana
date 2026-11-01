import * as React from 'react'
import { createPortal } from 'react-dom'
import { PageRenderer } from '@/components/pages/PageRenderer'
import type { PageLayout } from '@/lib/pageLayout'
import { cn } from '@/lib/utils'

/** Um viewport real: media queries e 100dvh se referem à prévia, não ao painel. */
export function PagePreview({ layout, title, device }: { layout: PageLayout; title: string; device: 'desktop' | 'mobile' }) {
  const [target, setTarget] = React.useState<HTMLElement | null>(null)
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const ref = React.useRef<HTMLIFrameElement>(null)
  const load = () => {
    const doc = ref.current?.contentDocument
    if (!doc) return
    doc.documentElement.lang = 'pt-BR'
    doc.documentElement.style.cssText = document.documentElement.style.cssText
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => doc.head.appendChild(node.cloneNode(true)))
    const base = doc.createElement('base')
    base.href = document.baseURI
    doc.head.appendChild(base)
    doc.body.style.margin = '0'
    setTarget(doc.body)
  }
  React.useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    const observer = new ResizeObserver(() => setSize({ width: Math.round(iframe.clientWidth), height: Math.round(iframe.clientHeight) }))
    observer.observe(iframe)
    return () => observer.disconnect()
  }, [])
  return <div className="min-w-0 space-y-2">
    <p className="text-xs text-muted-foreground" aria-live="polite">{device === 'mobile' ? 'Celular' : 'Computador'}{size.width > 0 ? ` · ${size.width} × ${size.height} px` : ''} · rascunho atual</p>
    <iframe ref={ref} title={`Prévia da página — ${device === 'mobile' ? 'celular' : 'computador'}`} onLoad={load} srcDoc="<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>" className={cn('mx-auto block h-[640px] w-full rounded-xl border bg-background', device === 'mobile' && 'max-w-[390px]')} />
    {target && createPortal(<div onClickCapture={e => { if ((e.target as Element).closest('a')) e.preventDefault() }}><PageRenderer layout={layout} title={title} preview /></div>, target)}
  </div>
}
