import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
export type PreviewDevice = 'desktop' | 'mobile'
const screens = { desktop: { width: 1024, height: 720, label: 'Desktop' }, mobile: { width: 390, height: 844, label: 'Celular' } }
const documentHtml='<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><main id="post-preview-root" style="padding:16px;min-width:0"></main></body></html>'
export function PreviewDeviceSwitch({device,onChange}:{device:PreviewDevice;onChange:(device:PreviewDevice)=>void}) {
 return <div role="group" aria-label="Dispositivo da pré-visualização" className="flex flex-wrap gap-2">{(['desktop','mobile'] as const).map(key=>{const Icon=key==='desktop'?Monitor:Smartphone;return <Button key={key} type="button" size="sm" variant={device===key?'default':'outline'} aria-pressed={device===key} onClick={()=>onChange(key)}><Icon className="size-4" aria-hidden="true" />{screens[key].label}</Button>})}</div>
}
/** A real iframe viewport makes media queries and picture sources match the selected screen. */
export function PostPreviewFrame({device,children}:{device:PreviewDevice;children:ReactNode}) {
 const container=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null)
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [available,setAvailable]=useState(0)
 const screen=screens[device]
 const scale=available?Math.min(1,Math.max(1,available-2)/screen.width):1
 useLayoutEffect(()=>{
   const element=container.current;if(!element)return
   const measure=()=>setAvailable(element.clientWidth)
   measure();if(typeof ResizeObserver==='undefined')return
   const observer=new ResizeObserver(measure);observer.observe(element);return()=>observer.disconnect()
 },[])
 useLayoutEffect(()=>{
   if(!host)return
   const target=host.ownerDocument.head
   const copy=()=>{host.ownerDocument.documentElement.style.cssText=document.documentElement.style.cssText;host.ownerDocument.documentElement.className=document.documentElement.className;target.querySelectorAll('[data-preview-style]').forEach(n=>n.remove());document.head.querySelectorAll('style,link[rel="stylesheet"]').forEach(node=>{const clone=node.cloneNode(true) as HTMLElement;clone.dataset.previewStyle='true';target.appendChild(clone)})}
   copy();const observer=new MutationObserver(copy);observer.observe(document.head,{childList:true,subtree:true,characterData:true});observer.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});return()=>observer.disconnect()
 },[host])
 return <section aria-label={`Prévia ${screen.label}`} className="min-w-0 space-y-2">
 <p className="text-xs text-muted-foreground">{screen.label} · {screen.width} × {screen.height} px{scale<1?' · reduzido para caber na área de prévia':''}</p>
 <div ref={container} className="w-full min-w-0">
 <div className="relative mx-auto overflow-hidden rounded-lg border bg-background" style={{width:screen.width*scale+2,height:screen.height*scale+2}}><iframe ref={frame} title={`Pré-visualização do post — ${screen.label}`} sandbox="allow-same-origin" srcDoc={documentHtml} onLoad={()=>setHost(frame.current?.contentDocument?.getElementById('post-preview-root')??null)} style={{width:screen.width,height:screen.height,transform:`scale(${scale})`,transformOrigin:'top left',border:0,display:'block'}} />
 {host&&createPortal(<div onClickCapture={e=>{if((e.target as HTMLElement).closest('a'))e.preventDefault()}}>{children}</div>,host)}</div></div>
 </section>
}
